import {getDatastoreQuerySql} from "./sql.js";
import {convertDatasetToDistributionId, getDatasetByKeyword, getDatasetByTitleName} from "./metastore.js";
import Plotly from 'https://cdn.jsdelivr.net/npm/plotly.js-dist/+esm';

//NADAC Related
async function getNadacMeds(){
    //uses the 2017 nadac
    const sql = `[SELECT ndc_description FROM f4ab6cb6-e09c-52ce-97a2-fe276dbff5ff]`;
    const medObjects = await getDatastoreQuerySql(sql);
    const medList = new Set(medObjects.map(med => med.ndc_description.toUpperCase()));
    return Array.from(medList).sort();
}

async function getMedNames(medicine){
    const medList = await getNadacMeds()
    return medList.filter(med => med.includes(`${medicine.toUpperCase()} `))
}

async function getMedData(medList, vars = {xAxis: "as_of_date", yAxis: "nadac_per_unit"}){
    let nadacDatasets = (await getDatasetByKeyword("nadac")).filter(r => r.title.includes("(National Average Drug Acquisition Cost)"));
    let nadacDistributions = await Promise.all(nadacDatasets.map(r => {return convertDatasetToDistributionId(r.identifier)}))
    return await getPlotData(medList, {xAxis: vars.xAxis, yAxis: vars.yAxis, filter: "ndc_description"}, nadacDistributions)
}

async function plotNadacMed(medList, layout, vars) {
    const medListOutput = Array.isArray(medList) ? medList : [medList];
    if (medListOutput.length === 0) return;
    const data = await Promise.all(medListOutput.map(async (med) => {
        if (typeof med === "string") {
            return await getMedData([med], vars);
        } else {
            return await getMedData(med, vars);
        }
    }));
    return plot(data, layout, "line");
}

//ADULT AND CHILD HEALTH CARE QUALITY MEASURES
async function getHealthcareQualityData(qualityMeasure){
    let dataset = await getDatasetByTitleName("2020 Child and Adult Health Care Quality Measures Quality");
    let distributionId = await convertDatasetToDistributionId(dataset.identifier)
    return await getDatastoreQuerySql(`[SELECT * FROM ${distributionId}][WHERE measure_name === "${qualityMeasure}"]`)
}

async function getQualityMeasures(){
    let dataset = await getDatasetByTitleName("2020 Child and Adult Health Care Quality Measures Quality");
    let distributionId = await convertDatasetToDistributionId(dataset.identifier)
    let measureObjects = await getDatastoreQuerySql(`[SELECT measure_name FROM ${distributionId}]`)
    return new Set(measureObjects.map(measure => {return measure.measure_name}));
}

async function getRateDefinitions(qualityMeasure){
    return new Set((await getHealthcareQualityData(qualityMeasure)).map(x => {return x.rate_definition}));
}

async function getStates(rateDef, qualityMeasure){
    let filteredData = (await getHealthcareQualityData(qualityMeasure)).filter(x => x.rate_definition === rateDef)
    return new Set(filteredData.map(x => {return x.state}));
}

async function getRateData(rateDef, qualityMeasure){
    let xValues = Array.from(await getStates(rateDef, qualityMeasure))
    let filteredYValues = (await getHealthcareQualityData(qualityMeasure)).filter(x => x.rate_definition === rateDef)
    let yValues = filteredYValues.map(x => {return x.state_rate})
    return {x: xValues, y: yValues, name: `2022: ${rateDef}`}
}
async function getStateMeasureData(stateList, vars, rateName){
    let xValues = new Set();
    let yValues = [];
    let datasets = await getDatasetByKeyword("performance rates");
    let distributionIds = await Promise.all(datasets.map(x => {return convertDatasetToDistributionId(x.identifier)}))
    let rawData =  await getAllData(stateList, vars, distributionIds)
    let data = rawData.filter(x => x !== undefined);
    data.forEach(dataset => {
        let count = 0;
        let sum = 0;
        dataset.filter(x => x.rate_definition === rateName).forEach(datapoint => {
            xValues.add(datapoint[vars.xAxis])
            sum += Number.parseFloat(datapoint[vars.yAxis])
            count++
        })
        if (count > 0){
            yValues.push(sum/count)
        }
    })
    return {x: Array.from(xValues).sort(), y: yValues, name: stateList[0]}
}
async function plotMeasure(stateList, layout, vars, rateDef) {
    const states = Array.isArray(stateList) ? stateList : [stateList];
    if (states.length === 0) return;
    const data = await Promise.all(states.map(async (state) => {
        if (typeof state === "string") {
            return await getStateMeasureData([state], vars, rateDef);
        } else {
            return await getStateMeasureData(state, vars, rateDef);
        }
    }));
    return plot(data, layout, "line");
}

//GENERAL
function plot(data, layout, type = "line"){
    try{
        const adjustedData = Array.isArray(data) ? data : [data];
        const div = document.createElement('div');
        for (let trace of adjustedData){trace.type = type;}
        Plotly.newPlot(div, adjustedData, layout);
        return div;
    } catch (error){
        console.log("The plot could not be created.")
    }
}

async function getPlotData(items, vars, distributions) {
    try{
        const xValues = [];
        const yValues = [];
        const data = (await getAllData(items, vars, distributions)).flat();
        data.forEach(datapoint => {
            xValues.push(datapoint[vars.xAxis]);
            yValues.push(datapoint[vars.yAxis]);
        })
        return {x: xValues.sort(), y: yValues, name: (items[0].split(' '))[0]}
    } catch(error){
        console.log("An error occurred in data collection.")
    }
}

async function getAllData(items, vars, distributions){
    let varsString = ""
    const fetchDataPromises = [];
    Object.values(vars).forEach(v => {varsString += `,${v}`})
    varsString = varsString.slice(1, varsString.length)
    const fetchData = async (identifier, item) => {
        let sql = `[SELECT ${varsString} FROM ${identifier}][WHERE ${vars.filter} = "${item}"]`;
        return await getDatastoreQuerySql(sql);
    }
    for (let distributionId of distributions) {
        items.forEach(item => {
            fetchDataPromises.push(fetchData(distributionId, item));
        })
    }
    return await Promise.all(fetchDataPromises);
}

//OBSERVABLE NOTEBOOK RELATED METHODS
async function getSimilarMeds(medList) {
    let allSimMeds = [];
    for (let i of medList) {
        let generalName = i.split(" ")[0];
        let meds = await getMedNames(generalName);
        for (let m of meds) {
            if (allSimMeds.some((med) => med.generalDrug === generalName && med.specificName === m)) {
                allSimMeds.push({
                    generalDrug: `${generalName}2`,
                    specificName: m
                });
            } else {
                allSimMeds.push({
                    generalDrug: generalName,
                    specificName: m
                });
            }
        }
    }
    return allSimMeds;
}

function parseSelectedMeds(medList) {
    return Object.values(medList.reduce((result, obj) => {
        const {generalDrug, specificName} = obj;
        if (generalDrug in result) {
            result[generalDrug].push(specificName);
        } else {
            result[generalDrug] = [specificName];
        }
        return result;
    }, {}));
}

export {
    getNadacMeds,
    getMedNames,
    getMedData,
    plotNadacMed,
    getQualityMeasures,
    getRateDefinitions,
    getStates,
    getRateData,
    plotMeasure,
    plot,
    getSimilarMeds,
    parseSelectedMeds,
    Plotly
}