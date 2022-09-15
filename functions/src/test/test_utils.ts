// istanbul-ignore-file
import fs from 'fs';
import path from 'path';

const mockXMLPath = path.resolve(__dirname, './mockCAPAlert.xml');
export const readXML = () => fs.readFileSync(mockXMLPath, { encoding: 'utf-8' });
