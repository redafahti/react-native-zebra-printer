import { Buffer } from 'buffer';
import * as iconv from 'iconv-lite';

import BufferHelper from './buffer-helper';

const init_printer_bytes = Buffer.from([27, 64]);
const l_start_bytes = Buffer.from([27, 97, 0]);
const l_end_bytes = Buffer.from([]);
const c_start_bytes = Buffer.from([27, 97, 1]);
const c_end_bytes = Buffer.from([]); // [ 27, 97, 0 ];
const r_start_bytes = Buffer.from([27, 97, 2]);
const r_end_bytes = Buffer.from([]);

const default_space_bytes = Buffer.from([27, 50]);

const reset_bytes = Buffer.from([27, 97, 0, 29, 33, 0, 27, 50]);
const m_start_bytes = Buffer.from([27, 33, 16, 28, 33, 8]);
const m_end_bytes = Buffer.from([27, 33, 0, 28, 33, 0]);
const b_start_bytes = Buffer.from([27, 33, 48, 28, 33, 12]);
const b_end_bytes = Buffer.from([27, 33, 0, 28, 33, 0]);
const cm_start_bytes = Buffer.from([27, 97, 1, 27, 33, 16, 28, 33, 8]);
const cm_end_bytes = Buffer.from([27, 33, 0, 28, 33, 0]);
const cb_start_bytes = Buffer.from([27, 97, 1, 27, 33, 48, 28, 33, 12]);
const cb_end_bytes = Buffer.from([27, 33, 0, 28, 33, 0]);
const cd_start_bytes = Buffer.from([27, 97, 1, 27, 33, 32, 28, 33, 4]);
const cd_end_bytes = Buffer.from([27, 33, 0, 28, 33, 0]);
const d_start_bytes = Buffer.from([27, 33, 32, 28, 33, 4]);
const d_end_bytes = Buffer.from([27, 33, 0, 28, 33, 0]);

const cut_bytes = Buffer.from([27, 105]);
const beep_bytes = Buffer.from([27, 66, 3, 2]);
const line_bytes = Buffer.from([10, 10, 10, 10, 10]);

const options_controller: any = {
  cut: cut_bytes,
  beep: beep_bytes,
  tailingLine: line_bytes,
};

const controller: any = {
  '<M>': m_start_bytes,
  '</M>': m_end_bytes,
  '<B>': b_start_bytes,
  '</B>': b_end_bytes,
  '<D>': d_start_bytes,
  '</D>': d_end_bytes,
  '<C>': c_start_bytes,
  '</C>': c_end_bytes,
  '<CM>': cm_start_bytes,
  '</CM>': cm_end_bytes,
  '<CD>': cd_start_bytes,
  '</CD>': cd_end_bytes,
  '<CB>': cb_start_bytes,
  '</CB>': cb_end_bytes,
  '<L>': l_start_bytes,
  '</L>': l_end_bytes,
  '<R>': r_start_bytes,
  '</R>': r_end_bytes,
};

type IOptions = {
  beep: boolean;
  cut: boolean;
  tailingLine: boolean;
  encoding: string;
};

const default_options: IOptions = {
  beep: false,
  cut: true,
  tailingLine: true,
  encoding: 'UTF8',
};

export function exchange_text(text: string, options: IOptions): Buffer {
  const m_options = options || default_options;

  let bytes = new BufferHelper();
  bytes.concat(init_printer_bytes);
  bytes.concat(default_space_bytes);
  let temp = '';
  for (let i = 0; i < text.length; i++) {
    let ch = text[i];
    switch (ch) {
      case '<':
        bytes.concat(iconv.encode(temp, m_options.encoding));
        temp = '';
        // add bytes for changing font and justifying text
        for (const tag in controller) {
          if (text.substring(i, i + tag.length) === tag) {
            bytes.concat(controller[tag]);
            i += tag.length - 1;
          }
        }
        break;
      case '\n':
        temp = `${temp}${ch}`;
        bytes.concat(iconv.encode(temp, m_options.encoding));
        bytes.concat(reset_bytes);
        temp = '';
        break;
      default:
        temp = `${temp}${ch}`;
        break;
    }
  }
  temp.length && bytes.concat(iconv.encode(temp, m_options.encoding));

  // check for "encoding" flag
  if (
    typeof m_options['encoding'] === 'boolean' &&
    options_controller['encoding']
  ) {
    bytes.concat(options_controller['encoding']);
  }

  // check for "tailingLine" flag
  if (
    typeof m_options['tailingLine'] === 'boolean' &&
    m_options['tailingLine'] &&
    options_controller['tailingLine']
  ) {
    bytes.concat(options_controller['tailingLine']);
  }

  // check for "cut" flag
  if (
    typeof m_options['cut'] === 'boolean' &&
    m_options['cut'] &&
    options_controller['cut']
  ) {
    bytes.concat(options_controller['cut']);
  }

  // check for "beep" flag
  if (
    typeof m_options['beep'] === 'boolean' &&
    m_options['beep'] &&
    options_controller['beep']
  ) {
    bytes.concat(options_controller['beep']);
  }

  return bytes.toBuffer();
}
