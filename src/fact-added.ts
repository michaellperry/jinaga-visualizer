import { VisualizerNode } from "./visualizer-node";
import { FactRecord, FactReference } from "jinaga";

export type Mutator<T> = (transformer: (oldValue: T) => T) => void;

export function factAdded(setNodes: Mutator<VisualizerNode[]>) {
    return (factRecord: FactRecord) => {
        const transformers = [
            addSuccessors(factRecord),
            addNewVisualizerNode(factRecord)
        ];
        setNodes(transformers.reduce(compose, t => t));
    }
}

type Transformer = (oldValue: VisualizerNode[]) => VisualizerNode[];

function compose(a: Transformer, b: Transformer): Transformer {
    return oldValue => b(a(oldValue));
}

function addSuccessors(factRecord: FactRecord): Transformer {
    return oldValue => oldValue.map(oldNode => ({
        ...oldNode,
        successors: Array.from(predecessorRoles(oldNode.fact, factRecord))
            .reduce((successors, role) => ({
                ...successors,
                [`${role}:${factRecord.type}`]: [
                    factRecord.hash
                ]
            }), oldNode.successors)
    }));
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
    return oldValue => [
        ...oldValue,
        {
            fact: factRecord,
            successors: {}
        }
    ];
}