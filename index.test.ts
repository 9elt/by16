import { expect, test } from "bun:test";
import fs from "fs";
import { decode } from "jpeg-js";
import { by16 } from ".";

test("single color", () => {
    const bytes = [255, 255, 255, 255];
    const clusters = by16(bytes);

    expect(clusters.length).toBe(1);

    const [white] = clusters;

    expect(white.area).toBe(1);
    expect(white.id).toBe(15);
    expect(white.code).toBe(7);

    const [r, g, b] = white.bytes;

    expect(r).toBe(255);
    expect(g).toBe(255);
    expect(b).toBe(255);
});

test("two distinct colors", () => {
    const bytes = [
        255, 255, 255, 255,
        255, 0, 0, 255,
    ];
    const clusters = by16(bytes);

    expect(clusters.length).toBe(2);

    const [red, white] = clusters;

    {
        expect(red.area).toBe(0.5);
        expect(red.id).toBe(4);
        expect(red.code).toBe(4);

        const [r, g, b] = red.bytes;

        expect(r).toBe(255);
        expect(g).toBe(0);
        expect(b).toBe(0);
    }
    {
        expect(white.area).toBe(0.5);
        expect(white.id).toBe(15);
        expect(white.code).toBe(7);

        const [r, g, b] = white.bytes;

        expect(r).toBe(255);
        expect(g).toBe(255);
        expect(b).toBe(255);
    }
});

test("single color shade", () => {
    const bytes = [
        200, 0, 0, 255,
        255, 0, 0, 255,
    ];
    const clusters = by16(bytes);

    expect(clusters.length).toBe(1);

    const [red] = clusters;

    expect(red.area).toBe(1);
    expect(red.id).toBe(4);
    expect(red.code).toBe(4);

    const [r, g, b] = red.bytes;

    expect(r).toBe(228);
    expect(g).toBe(0);
    expect(b).toBe(0);
});

test("skyline r-34", () => {
    const bytes = decode(
        fs.readFileSync("./media/skyline-gtr-34.jpg")
    ).data;

    const clusters = by16(bytes);

    expect(clusters.length).toBe(15);

    expect(clusters).toMatchObject([
        {
            id: 0,
            code: 0,
            area: 0.5243051734468044,
            bytes: new Uint8ClampedArray([36, 37, 30]),
        },
        {
            id: 1,
            code: 1,
            area: 0.0680856657251507,
            bytes: new Uint8ClampedArray([10, 63, 162]),
        },
        {
            id: 3,
            code: 3,
            area: 0.02785725639802893,
            bytes: new Uint8ClampedArray([88, 145, 185]),
        },
        {
            id: 4,
            code: 4,
            area: 0.0031057799298142646,
            bytes: new Uint8ClampedArray([139, 99, 45]),
        },
        {
            id: 5,
            code: 5,
            area: 0.00024760647078243646,
            bytes: new Uint8ClampedArray([132, 124, 133]),
        },
        {
            id: 6,
            code: 6,
            area: 0.011438807576146633,
            bytes: new Uint8ClampedArray([158, 138, 109]),
        },
        {
            id: 7,
            code: 7,
            area: 0.06204223371605346,
            bytes: new Uint8ClampedArray([157, 170, 185]),
        },
        {
            id: 8,
            code: 0,
            area: 0.14213834170915715,
            bytes: new Uint8ClampedArray([88, 83, 66]),
        },
        {
            id: 9,
            code: 1,
            area: 0.0364409473851534,
            bytes: new Uint8ClampedArray([42, 107, 192]),
        },
        {
            id: 10,
            code: 2,
            area: 0.00044018928139099813,
            bytes: new Uint8ClampedArray([118, 131, 119]),
        },
        {
            id: 11,
            code: 3,
            area: 0.038534903341770295,
            bytes: new Uint8ClampedArray([99, 153, 226]),
        },
        {
            id: 12,
            code: 4,
            area: 0.014471222625729063,
            bytes: new Uint8ClampedArray([142, 116, 90]),
        },
        {
            id: 13,
            code: 5,
            area: 0.0000030568700096597093,
            bytes: new Uint8ClampedArray([129, 91, 200]),
        },
        {
            id: 14,
            code: 6,
            area: 0.0003698812711688248,
            bytes: new Uint8ClampedArray([198, 152, 111]),
        },
        {
            id: 15,
            code: 7,
            area: 0.07051893425283984,
            bytes: new Uint8ClampedArray([205, 219, 233]),
        },
    ]);
});
