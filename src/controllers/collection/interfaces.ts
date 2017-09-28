interface CollectionMetaData {
    name: string;
    shardKey: string;
    shardKeyPrefix?: string;
}

interface CollectionData {
    documents: any[];
    meta: CollectionMetaData;
}

interface CollectionStore {
    create: (shardKey: string) => CollectionData;
    getDocuments: () => any[];
    getMetaData: () => CollectionMetaData;
    persistDocuments: (documents: any[]) => void;
    persistMetaData: (metaData: CollectionMetaData) => void;
    flush: () => void;
}