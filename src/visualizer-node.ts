import { FactRecord } from "jinaga";

export interface VisualizerNode {
    fact: FactRecord;
    successors: { [roleAndType: string]: string };
}
