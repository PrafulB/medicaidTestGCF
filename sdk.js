import {
    getSchemas,
    getSpecificSchema,
    getSchemaItems,
    getAllDatasetUrls,
    getDatasetByTitleName,
    getDatasetByKeyword,
    getDatasetByDescription,
    getSchemaItemById,
    getDatasetById,
    getDatasetByDownloadUrl,
    parseDatasetUrl,
    convertDatasetToDistributionId,
    convertDistributionToDatasetId,
    getDistributionByDownloadUrl,
    getDistributionById
} from './sdk/metastore.js';

import {
    postDatastoreQuery,
    getDatastoreImport,
    postDatastoreQueryDownload,
    postDatastoreQueryDistributionId,
    postDatastoreQueryDatasetId,
    getDatastoreQueryDistributionId,
    getDatastoreQueryDatasetId,
    getAllDataFromDataset,
    getAllDataFromDistribution,
    getDownloadByDistributionId,
    getDownloadByDatasetId
} from './sdk/datastore.js';

import {
    getSearchFacets,
    getSearch
} from "./sdk/search.js";

import {
    getDatastoreQuerySql
} from "./sdk/sql.js"

import {
    endpointStore,
    getItems,
    clearCache
} from "./sdk/httpMethods.js"

import {
    getAllNdcObjs,
    getNadacMeds,
    getNdcFromMed,
    getMedNames,
    getMedData,
    plotNadacNdc,
    plotNadacMed
} from "./sdk/plot/nadac.js"

import {
    getQualityMeasures,
    getRateDefinitions,
    getStates,
    plotRateBar,
    plotRateTimeSeries
} from "./sdk/plot/healthcareMeasures.js"

import {
    getUtilData,
    plotUtilTimeSeries,
    plotDrugUtilBar,
    getDrugUtilDataBar,
    plotUtilMap,
    // getDrugUtilDataXX,
    // plotDrugUtilDataXX
} from "./sdk/plot/drugUtilization.js"

import {
    getUniqueValues,
    plot,
    Plotly
} from "./sdk/plot/plot.js"

import {
    getAllDiseases,
    diseaseToDrugs
} from "./sdk/rxNorm.js"

export {
    endpointStore,
    getItems,
    clearCache,
    //metastore
    getSchemas,
    getSpecificSchema,
    getSchemaItems,
    getAllDatasetUrls,
    getDatasetByTitleName,
    getDatasetByKeyword,
    getDatasetByDescription,
    getSchemaItemById,
    getDatasetById,
    getDatasetByDownloadUrl,
    parseDatasetUrl,
    convertDatasetToDistributionId,
    convertDistributionToDatasetId,
    getDistributionByDownloadUrl,
    getDistributionById,
    //datastore
    getDatastoreImport,
    postDatastoreQuery,
    postDatastoreQueryDownload,
    postDatastoreQueryDistributionId,
    postDatastoreQueryDatasetId,
    getDatastoreQueryDistributionId,
    getDatastoreQueryDatasetId,
    getAllDataFromDataset,
    getAllDataFromDistribution,
    getDownloadByDistributionId,
    getDownloadByDatasetId,
    //sql
    getDatastoreQuerySql,
    //search
    getSearchFacets,
    getSearch,
    //plot
    Plotly,
    plot,
    getUniqueValues,
    //Nadac
    getAllNdcObjs,
    getNadacMeds,
    getNdcFromMed,
    getMedNames,
    plotNadacNdc,
    plotNadacMed,
    getMedData,
    //healthcare quality
    getQualityMeasures,
    getRateDefinitions,
    getStates,
    //drug utilization
    getUtilData,
    getDrugUtilDataBar,
    plotRateBar,
    plotRateTimeSeries,
    plotUtilTimeSeries,
    plotDrugUtilBar,
    // getDrugUtilDataXX,
    // plotDrugUtilDataXX,
    plotUtilMap,
    //rxNorm
    getAllDiseases,
    diseaseToDrugs
}

//initialize localforage
getSchemas().then();