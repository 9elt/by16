type By4Cluster = {
    /** The 4-bit color id */
    id: number;
    /** The 3-bit color code */
    code: number;
    /** The fraction of the total pixels that the color represents */
    area: number;
    /** The average color of the cluster */
    bytes: Uint8ClampedArray;
};

function by4(
    bytes: Uint8ClampedArray,
    pxsize = 4,
    aprox = Math.ceil(bytes.length / 4147200)
): By4Cluster[] {
    const pxincr = pxsize * aprox;
    const samples = bytes.length / pxincr;

    // NOTE: 16 * (count, red, green, blue)
    const map = new Uint32Array(64).fill(0);

    for (let i = 0; i < bytes.length; i += pxincr) {
        const r = bytes[i];
        const g = bytes[i + 1];
        const b = bytes[i + 2];

        // NOTE: second most relevant bits of each channel
        const n2relev = (b + (g << 8) + (r << 16)) & 4210752;

        const map_i =
            // NOTE: the 4-bit color id is composed by
            // 1-bit "plus" flag + 3-bit color representation
            (
                // NOTE: the "plus" flag is 1 when at least two
                // of the second most relevant bits are 1
                (n2relev & (n2relev - 1) ? 8 : 0)
                // NOTE: the 3-bit color representation
                + (b >> 7) + ((g >> 7) << 1) + ((r >> 7) << 2)
            )
            // NOTE: the map index is the 4-bit color id * 4
            * 4;

        map[map_i]++;
        map[map_i + 1] += r;
        map[map_i + 2] += g;
        map[map_i + 3] += b;
    }

    const result: By4Cluster[] = [];

    for (let map_i = 0; map_i < 64; map_i += 4) {
        const count = map[map_i];

        if (count > 0) {
            const bytes = new Uint8ClampedArray(3);

            bytes[0] = map[map_i + 1] / count;
            bytes[1] = map[map_i + 2] / count;
            bytes[2] = map[map_i + 3] / count;

            const id = map_i >> 2;

            result.push({
                id,
                code: id & 7,
                area: count / samples,
                bytes,
            });
        }
    }

    return result;
}
