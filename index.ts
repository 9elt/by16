export type Cluster = {
    /**
     * The 4-bit cluster id, unique within a cluster list
     *
     * 0  (0b0000) black
     * 1  (0b0001) dark blue
     * 2  (0b0010) dark green
     * 3  (0b0011) dark cyan
     * 4  (0b0100) dark red
     * 5  (0b0101) dark magenta
     * 6  (0b0110) dark yellow
     * 7  (0b0111) dark white (light gray)
     * 8  (0b1000) light black (gray)
     * 9  (0b1001) light blue
     * 10 (0b1010) light green
     * 11 (0b1011) light cyan
     * 12 (0b1100) light red
     * 13 (0b1101) light magenta
     * 14 (0b1110) light yellow
     * 15 (0b1111) white
     */
    id: number;
    /**
     * The 3-bit color representation, also the cluster id
     * without its most relevant bit, in a cluster list the
     * same code can appear twice
     *
     * 0 (0b000) black
     * 1 (0b001) blue
     * 2 (0b010) green
     * 3 (0b011) cyan
     * 4 (0b100) red
     * 5 (0b101) magenta
     * 6 (0b110) yellow
     * 7 (0b111) white
     */
    code: number;
    /**
     * The fraction of the total pixels that the color represents
     */
    area: number;
    /**
     * The average color of the cluster
     */
    bytes: Uint8ClampedArray;
};

export function by16(
    bytes: Uint8ClampedArray | Uint8Array | Uint16Array | Uint32Array | number[],
    /**
     * Number of channels per pixel
     * defaults to 4 for r, g, b, a
     */
    pxsize = 4,
    /**
     * Positive integer to control how densely the image is scanned,
     * 1 to visit every pixel, >1 to reduce sampling density
     * defaults to ceil(bytes / (4K / 2 - 1))
     */
    step = bytes.length / 4147199
): Cluster[] {
    const pxincr = pxsize * Math.ceil(step);
    const samples = bytes.length / pxincr;

    // NOTE: 16 * (count, red, green, blue)
    const map = new Float64Array(64).fill(0);

    for (let i = 0; i < bytes.length; i += pxincr) {
        const r = bytes[i];
        const g = bytes[i + 1];
        const b = bytes[i + 2];

        // NOTE: Second most relevant bits of each channel
        const n2relev = (b + (g << 8) + (r << 16)) & 4210752;

        const map_i =
            // NOTE: The 4-bit cluster id is composed by
            // 1-bit "plus" flag + 3-bit color representation
            (
                // NOTE: The "plus" flag is 1 when at least two
                // of the second most relevant bits are 1
                (n2relev & (n2relev - 1) ? 8 : 0)
                // NOTE: The 3-bit color representation
                + (b >> 7) + ((g >> 7) << 1) + ((r >> 7) << 2)
            )
            // NOTE: The map index is the 4-bit cluster id * 4
            * 4;

        map[map_i]++;
        map[map_i + 1] += r;
        map[map_i + 2] += g;
        map[map_i + 3] += b;
    }

    const result: Cluster[] = [];

    for (let map_i = 0; map_i < 64; map_i += 4) {
        const count = map[map_i];

        if (count > 0) {
            const bytes = new Uint8ClampedArray(3);

            bytes[0] = map[map_i + 1] / count;
            bytes[1] = map[map_i + 2] / count;
            bytes[2] = map[map_i + 3] / count;

            const id = map_i / 4;

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
