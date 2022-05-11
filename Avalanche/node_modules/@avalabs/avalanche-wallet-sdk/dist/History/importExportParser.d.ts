import { iHistoryImportExport } from "./types";
import { OrteliusAvalancheTx } from "../Explorer";
export declare function getImportSummary(tx: OrteliusAvalancheTx, addresses: string[]): iHistoryImportExport;
export declare function getExportSummary(tx: OrteliusAvalancheTx, addresses: string[]): iHistoryImportExport;
