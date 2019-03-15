import { VisualizerNode } from "./visualizer-node";
import { FactRecord } from "jinaga";

export type Mutator<T> = (transformer: (oldValue: T) => T) => void;

export function factAdded(setNodes: Mutator<VisualizerNode[]>) {
    return (factRecord: FactRecord) => {
        setNodes(oldValue => [
            ...oldValue,
            {
                fact: factRecord,
                successors: {}
            }
        ]);
    }
}