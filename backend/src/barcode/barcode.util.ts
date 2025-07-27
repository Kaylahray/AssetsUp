import * as bwipjs from 'bwip-js';

export async function generateBarcodeBuffer(code: string, format: 'png' | 'svg'): Promise<Buffer> {
  if (format === 'png') {
    return await bwipjs.toBuffer({
      bcid: 'code128',
      text: code,
      scale: 3,
      height: 10,
      includetext: true,
    });
  } else {
    // SVG: bwip-js returns a string, not a Buffer, when output: 'svg' is used
    return Buffer.from(
      await new Promise<string>((resolve, reject) => {
        bwipjs.toBuffer({
          bcid: 'code128',
          text: code,
          scale: 3,
          height: 10,
          includetext: true,
          // @ts-ignore
          output: 'svg',
        }, (err: any, png: Buffer | string) => {
          if (err) return reject(err);
          resolve(typeof png === 'string' ? png : png.toString('utf8'));
        });
      })
    );
  }
}
