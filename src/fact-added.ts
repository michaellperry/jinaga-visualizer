import { FactRecord, FactReference } from "jinaga";
import { SuccessorCollection, VisualizerNode, VisualizerGraph } from "./visualizer-node";

export type Mutator<T> = (transformer: (oldValue: T) => T) => void;

export function factAdded(setNodes: Mutator<VisualizerGraph>) {
    return (factRecord: FactRecord) => {
        const transformers = [
            addSuccessors(factRecord),
            addNewVisualizerNode(factRecord)
        ];
        setNodes(transformers.reduce(compose, t => t));
    }
}

type Transformer = (oldValue: VisualizerGraph) => VisualizerGraph;

function compose(a: Transformer, b: Transformer): Transformer {
    return oldValue => b(a(oldValue));
}

function addSuccessors(factRecord: FactRecord): Transformer {
    return oldValue => Object.keys(oldValue).reduce((graph, key) => ({
        ...graph,
        [key]: {
            ...oldValue[key],
            successors: Array.from(predecessorRoles(oldValue[key].fact, factRecord))
                .reduce((successors, role) => addSuccessor(successors, role, factRecord), oldValue[key].successors)
        }
    }), {} as VisualizerGraph);
}

function addSuccessor(
    successors: SuccessorCollection,
    role: string,
    successorReference: FactReference
) {
    const roleAndType = `${role}:${successorReference.type}`;
    const oldHashes = successors[roleAndType];
    const hashes = oldHashes ? [
        ...oldHashes,
        successorReference.hash
    ] : [
        successorReference.hash
    ];
    return {
        ...successors,
        [roleAndType]: hashes
    };
}

function* predecessorRoles(targetReference: FactReference, newRecord: FactRecord) {
    for (const role in newRecord.predecessors) {
        const predecessors = newRecord.predecessors[role];
        if (Array.isArray(predecessors)) {
            for (let index = 0; index < predecessors.length; index++) {
                const p = predecessors[index];
                if (p.hash === targetReference.hash &&
                    p.type === targetReference.type
                ) {
                    yield role;
                }
            }
        }
        else {
            if (predecessors.hash === targetReference.hash &&
                predecessors.type === targetReference.type
            ) {
                yield role;
            }
        }
    }
}

function addNewVisualizerNode(factRecord: FactRecord): Transformer {
    return oldValue => ({
        ...oldValue,
        [`${factRecord.type}:${factRecord.hash}`]: {
            fact: factRecord,
            successors: {}
        }
    });
}