type TsunamiCenter = 'PAAQ' | 'PHEB';
type BulletinNumber = number;
type UniqueID = string;
type Identifier = `${TsunamiCenter}-${BulletinNumber}-${UniqueID}`;
type Sender = `wcatwc@noaa.gov` | `webmaster@ptwc.noaa.gov` | `ntwc@noaa.gov`;
type Status = 'Actual' | 'Exercise' | 'System' | 'Test' | 'Draft';
type MsgType = 'Alert' | 'Update' | 'Cancel' | 'Ack' | 'Error';
type Scope = 'Public' | 'Restricted' | 'Private';
type Source = 'NTWC' | 'PTWC';
type Category =
  | 'Geo'
  | 'Met'
  | 'Safety'
  | 'Security'
  | 'Rescue'
  | 'Fire'
  | 'Health'
  | 'Env'
  | 'Transport'
  | 'Infra'
  | 'CBRNE'
  | 'Other';

type ResponseType =
  | 'Shelter'
  | 'Evacuate'
  | 'Prepare'
  | 'Execute'
  | 'Avoid'
  | 'Monitor'
  | 'Assess'
  | 'AllClear'
  | 'None';

type Severity = 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
type Urgency = 'Immediate' | 'Expected' | 'Future' | 'Past' | 'Unknown';
type Certainty = 'Observed' | 'Likely' | 'Possible' | 'Unlikely' | 'Unknown';
type ValuePair = {
  valueName: string;
  value: string;
};
type Location = string;
type Decimal = number;
/**
 * Represents ISO 8601 datetime format, excluding Zulu time ("Z").
 * @example "2022-05-26T15:38:01-00:00"
 */
type ISODateTime = string;

/**
 * Short text description of where the seismic event occurred
 * @example {  valueName: 'EventLocationName', value: '50 miles NW of Homer, Alaska' }
 */
type EventLocationName = {
  valueName: 'EventLocationName';
  value: string;
};

/** Preliminary magnitude of the seismic event */
type EventPreliminaryMagnitude = {
  valueName: 'EventPreliminaryMagnitude';
  value: number;
};

/**
 * Type of preliminary magnitude of the seismic event.
 * Note: value should be transformed to lowercase.
 */
type EventPreliminaryMagnitudeType = {
  valueName: 'EventPreliminaryMagnitudeType';
  value: 'md' | 'mL' | 'ms' | 'mw' | 'me' | 'mwp3' | 'mb';
};

/** Time stamp when the seismic event was originated */
type EventOriginTime = {
  valueName: 'EventOriginTime';
  value: ISODateTime;
};

/**
 * Preliminary depth of the seismic event.
 * @example { valueName: 'EventDepth', value: '39 kilometers' }
 * */
type EventDepth = {
  valueName: 'EventDepth';
  value: string;
};

/**
 * Comma separated string with preliminary latitude, longitude, and radius of the seismic event in decimal form.
 * Northern latitudes are positive, southern latitudes are negative.
 * Eastern longitudes are positive, western longitudes are negative.
 * Note: radius of 0.000 signifies a point
 * @example { valueName: 'EventLatLon', value: '60.084,-152.489 0.000' }
 * */
type EventLatLon = {
  valueName: 'EventLatLon';
  value: `${Decimal},${Decimal} ${Decimal}`;
};

/**
 * The Valid Time Event Code (VTEC) enables alert providers and vendors to automate and tailor the product
 * stream delivered to their clients.
 * @link http://www.weather.gov/om/vtec/
 * @example { valueName: 'VTEC', value: '/T.CON.PAAQ.TS.W.0079.110902T1545Z-110902T1645Z/' }
 * */
type VTEC = {
  valueName: 'VTEC';
  value: string;
};

/**
 * The Universal Geographic Code (UGC) typically specifies:
 * 1) The affected geographic area of the product or product segment, typically by state, county (or parish or
 * independent city), or unique NWS zone (land or marine).
 * 2) The product expiration time.
 * @link www.nws.noaa.gov/directives/sym/pd01017002curr.pdf
 * @example { valueName: 'NWSUGC', value: 'AKZ185-187-021645-' }
 * */
type NWSUGC = {
  valueName: 'NWSUGC';
  value: string;
};

/**
 * Tsunami warnings mean that a tsunami with significant widespread inundation is imminent, expected, or occurring.
 * Warnings indicate that widespread dangerous coastal flooding accompanied by powerful currents is possible and
 * may continue for several hours after the initial wave arrival.
 * */
type ProductDefinition = {
  valueName: 'ProductDefinition';
  value: string;
};

/**
 * Alpha/Numeric string with the product ID as `valueName` and description as `value`.
 * @link https://wcatwc.arh.noaa.gov/?page=product_list
 */
type Product = {
  valueName: string; // TODO: Enumerate based on product list
  value: string;
};

/**
 * [location] - Alpha/Numeric string identifying the location of the predicted arrival time.
 * @example { valueName: 'predictedArrivalTime: “Atka, Alaska”', value: '2011-09-02T03:29:00-0800' }
 */
type PredictedArrivalTime = {
  valueName: `predictedArrivalTime: "${Location}"`;
  value: ISODateTime;
};

/**
 * [location] - Alpha/Numeric string identifying the location of the observed arrival time.
 * @example { valueName: 'observedArrivalTime: “Atka, Alaska”', value: '2011-09-02T03:29:00-0800' }
 */
type ObservedArrivalTime = {
  valueName: `observedArrivalTime: "${Location}"`;
  value: ISODateTime;
};

/**
 * [location] - Alpha/Numeric string identifying the location of the predicted wave height.
 * @example { valueName: 'predictedWaveHeight: “Atka, Alaska”', value: '0.750m 2.461ft' }
 */
type PredictedWaveHeight = {
  valueName: `predictedWaveHeight: "${Location}"`;
  value: `${Decimal}m ${Decimal}ft`;
};

/**
 * [location] - Alpha/Numeric string identifying the location of the observed wave height.
 * @example { valueName: 'observedWaveHeight: “Atka, Alaska”', value: '0.750m 2.461ft' }
 */
type ObservedWaveHeight = {
  valueName: `observedWaveHeight: "${Location}"`;
  value: `${Decimal}m ${Decimal}ft`;
};

/**
 * Short text bulletin intended for Commercial Mobile Alert System (CMAS) dissemination.
 * This is part of the iPAWS profile. Text length is limited to 90 characters.
 * @example { valueName: 'CMAMtext', value: 'Tsunami danger on the coast. Go to high ground or move inland. Check local media. -NWS' }
 */
type CMAMtext = {
  valueName: 'CMAMtext';
  value: string;
};

type Parameters = Array<
  | EventLocationName
  | EventPreliminaryMagnitude
  | EventPreliminaryMagnitudeType
  | EventOriginTime
  | EventDepth
  | EventLatLon
  | VTEC
  | NWSUGC
  | ProductDefinition
  | Product
  | PredictedArrivalTime
  | ObservedArrivalTime
  | PredictedWaveHeight
  | ObservedWaveHeight
  | CMAMtext
>;

type Info = {
  category: Category;
  event: 'Tsunami'; // Specific to CAP-TSU
  urgency: Urgency;
  severity: Severity;
  certainty: Certainty;
  language?: 'en-US' | string;
  responseType?: ResponseType;
  audience?: string;
  eventCode?: Array<ValuePair>;
  effective?: ISODateTime;
  onset?: ISODateTime;
  expires?: ISODateTime;
  senderName?: string;
  headline?: string;
  description?: string;
  instruction?: string;
  web?: string;
  contact?: string;
  parameter?: Parameters;
};

type Alert = {
  identifier: Identifier;
  sender: Sender;
  sent: ISODateTime;
  status: Status;
  msgType: MsgType;
  source: Source;
  scope: Scope;
  code: 'profile:CAP-TSU:1.1';
  restriction?: string;
  addresses?: string;
  note?: string;
  references?: string;
  incidents?: string;
  info?: Array<Info>;
};

/**
 * The Common Alerting Protocol (CAP) 1.2
 * @link http://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html
 * @link https://www.tsunami.gov/cap/documents/CAP-TSU-v1.1.pdf
 */
export type CAPDoc = {
  alert: Alert;
};
