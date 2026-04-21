import mammoth from 'mammoth';
import path from 'path';

const files = [
  '../week 1.docx',
  '../week2.docx',
  '../week3.docx',
  '../week4.docx',
  '../week5.docx',
  '../week6.docx',
];

for (const f of files) {
  console.log('\n\n========= ' + f + ' =========');
  try {
    const result = await mammoth.extractRawText({ path: path.resolve(f) });
    // Print first 3000 chars only
    console.log(result.value.substring(0, 3000));
  } catch(e) {
    console.log('ERROR:', e.message);
  }
}