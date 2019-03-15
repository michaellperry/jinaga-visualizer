import { FactRecord } from "jinaga";

export type SuccessorCollection = {
    [roleAndType: string]: string[]
};

export interface VisualizerNode {
    fact: FactRecord;
    successors: SuccessorCollection;
}

export type VisualizerGraph = {
    [typeAndHash: string]: VisualizerNode
};