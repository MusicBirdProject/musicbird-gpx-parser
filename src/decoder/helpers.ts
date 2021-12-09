export function readBitsReversed(bin, count = 1): number {
    let  bits = 0;

    for (let i = 0; i < count; i++) {
        bits |= (bin.getUnsigned(1) << i);
    }

    return bits;
}

export function getString(bin, offset, length): string {
    bin.seek(offset);
    let buf: number[] = [];

    for (let i = 0; i < length; i++) {
        var code = bin.getUint8() & 0xFF;

        if (code == 0) break; // zero terminated string
        buf.push(code);
    }

    return String.fromCharCode.apply(null, buf);
}
