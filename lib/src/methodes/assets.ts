// --------------------------------------------------
// ASSETS METHODES
// --------------------------------------------------
// Includes:
// useAssetData
// useImageUrl

export const useAssetData = (asset: any): Record<string, unknown> | null => {
    const { immutable_data, data, template } = asset;
    return data
        ? data
        : immutable_data
        ? immutable_data
        : template && template.immutable_data
        ? template.immutable_data
        : null;
};

export const useImageUrl = (urlOrHash: string, width = 300, _static = false) => {
    const encodedUrl = encodeURIComponent(urlOrHash);
    return `https://resizer.neftyblocks.com?ipfs=${encodedUrl}&width=${width}&static=${_static}`;
};
