import { FactRecord } from "jinaga";

export type SuccessorCollection = {
    [roleAndType: string]: string[]
};

export interface VisualizerNode {
    fact: FactRecord;
    successors: SuccessorCollection;
    depth: number;
}

export type VisualizerGraph = {
    [typeAndHash: string]: VisualizerNode
};