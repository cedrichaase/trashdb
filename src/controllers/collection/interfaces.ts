export interface CollectionMetaData {
    name: string;
    shardKey: string;
    shardKeyPrefix?: string;
}

export interface CollectionData {
    documents: any[];
    meta: CollectionMetaData;
}

export interface CollectionStore {
    create: (shardKey: string) => Promise<CollectionData>;
    getDocuments: () => Promise<any[]>;
    getMetaData: () => Promise<CollectionMetaData>;
    persistDocuments: (documents: any[]) => void;
    persistMetaData: (metaData: CollectionMetaData) => void;
    flush: () => void;
}