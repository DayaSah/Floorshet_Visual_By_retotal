/**
 * Official NEPSE broker directory: maps broker number (as used in floorsheet_raw's
 * buyer_broker / seller_broker columns) to the registered broker name.
 */
export interface BrokerDirectoryEntry {
  id: number
  broker_no: string
  broker_name: string
}

export const BROKER_DIRECTORY: BrokerDirectoryEntry[] = [
  { id: 1, broker_no: '1', broker_name: 'Kumari Securities Pvt. Limited' },
  { id: 2, broker_no: '3', broker_name: 'Arun Securities Pvt. Limited' },
  { id: 3, broker_no: '4', broker_name: 'Stock Broker Opal Securities Investment Pvt. Limited' },
  { id: 4, broker_no: '5', broker_name: 'Market Securities Exchange Company Pvt. Limited' },
  { id: 5, broker_no: '6', broker_name: 'Agrawal Securities Pvt. Limited' },
  { id: 6, broker_no: '7', broker_name: 'J.F. Securities Company Pvt. Limited' },
  { id: 7, broker_no: '8', broker_name: 'Ashutosh Brokerage & Securities Pvt. Limited' },
  { id: 8, broker_no: '10', broker_name: 'Pragyan Securities Pvt. Limited' },
  { id: 9, broker_no: '11', broker_name: 'Malla & Malla Stock Broking Company Pvt. Limited' },
  { id: 10, broker_no: '13', broker_name: 'Thrive Brokerage House Pvt. Limited' },
  { id: 11, broker_no: '14', broker_name: 'Nepal Stock House Pvt. Limited' },
  { id: 12, broker_no: '16', broker_name: 'Primo Securities Pvt. Limited' },
  { id: 13, broker_no: '17', broker_name: 'ABC Securities Pvt. Limited' },
  { id: 14, broker_no: '18', broker_name: 'Sagarmatha Securities Pvt. Limited' },
  { id: 15, broker_no: '19', broker_name: 'Nepal Investment & Securities Trading Pvt. Limited' },
  { id: 16, broker_no: '20', broker_name: 'Sipla Securities Pvt. Limited' },
  { id: 17, broker_no: '21', broker_name: 'Midas Stock Broking Company Pvt. Limited' },
  { id: 18, broker_no: '22', broker_name: 'Siprabi Securities Pvt. Limited' },
  { id: 19, broker_no: '25', broker_name: 'Sweta Securities Pvt. Limited' },
  { id: 20, broker_no: '26', broker_name: 'Asian Securities Pvt. Limited' },
  { id: 21, broker_no: '28', broker_name: 'Shree Krishna Securities Limited' },
  { id: 22, broker_no: '29', broker_name: 'Trishul Securities And Investment Limited' },
  { id: 23, broker_no: '32', broker_name: 'Premier Securites Company Limited' },
  { id: 24, broker_no: '33', broker_name: 'Dakshinkali Investment Securities Pvt.Limited' },
  { id: 25, broker_no: '34', broker_name: 'Vision Securities Pvt.Limited' },
  { id: 26, broker_no: '35', broker_name: 'Kohinoor Investment and Securities Pvt.Ltd' },
  { id: 27, broker_no: '36', broker_name: 'Secured Securities Limited' },
  { id: 28, broker_no: '37', broker_name: 'Swarnalaxmi Securities Pvt.Limited' },
  { id: 29, broker_no: '38', broker_name: 'Dipshika Dhitopatra Karobar Co. Pvt.Limited' },
  { id: 30, broker_no: '39', broker_name: 'Sumeru Securities Pvt.Limited' },
  { id: 31, broker_no: '40', broker_name: 'Creative Securities Pvt.Limited' },
  { id: 32, broker_no: '41', broker_name: 'Linch Stock Market Limited' },
  { id: 33, broker_no: '42', broker_name: 'Sani Securities Company Limited' },
  { id: 34, broker_no: '43', broker_name: 'South Asian Bulls Pvt.Limited' },
  { id: 35, broker_no: '44', broker_name: 'Dynamic Money Managers Securities Pvt.Ltd' },
  { id: 36, broker_no: '45', broker_name: 'Imperial Securities Co .Pvt.Limited' },
  { id: 37, broker_no: '46', broker_name: 'Kalika Securities Pvt.Limited' },
  { id: 38, broker_no: '47', broker_name: 'Neev Securities Pvt.Ltd' },
  { id: 39, broker_no: '48', broker_name: 'Trishakti Securities Public Limited' },
  { id: 40, broker_no: '49', broker_name: 'Online Securities Pvt.Ltd' },
  { id: 41, broker_no: '50', broker_name: 'Crystal Kanchenjunga Securities Pvt.Ltd' },
  { id: 42, broker_no: '51', broker_name: 'Oxford Securities Pvt.Ltd' },
  { id: 43, broker_no: '52', broker_name: 'Sundhara Securities Limited' },
  { id: 44, broker_no: '53', broker_name: 'Investment Management Nepal Pvt. Ltd.' },
  { id: 45, broker_no: '54', broker_name: 'Sewa Securities Pvt. Ltd.' },
  { id: 46, broker_no: '55', broker_name: 'Bhrikuti Stock Broking Co. Pvt. Ltd.' },
  { id: 47, broker_no: '56', broker_name: 'Sri Hari Securities Pvt.Ltd' },
  { id: 48, broker_no: '57', broker_name: 'Araya Tara Investment And Securities Pvt. Ltd.' },
  { id: 49, broker_no: '58', broker_name: 'Naasa Securities Co. Ltd.' },
  { id: 50, broker_no: '59', broker_name: 'Deevyaa Securities & Stock House Pvt. Ltd' },
  { id: 51, broker_no: '60', broker_name: 'Nagarik Stock Dealer Company Ltd.' },
  { id: 52, broker_no: '61', broker_name: 'Bhole Ganesh Securities Limited' },
  { id: 53, broker_no: '62', broker_name: 'Capital Max Securities Limited' },
  { id: 54, broker_no: '63', broker_name: 'Himalayan Brokerage Company  Limited' },
  { id: 55, broker_no: '64', broker_name: 'Sun Securities Private Limited' },
  { id: 56, broker_no: '65', broker_name: 'Sharepro Securities Private Limited' },
  { id: 57, broker_no: '66', broker_name: 'Miyo Securities Private Limited' },
  { id: 58, broker_no: '67', broker_name: 'Property Wizard Limited' },
  { id: 59, broker_no: '68', broker_name: 'Elite Stock House Limited' },
  { id: 60, broker_no: '69', broker_name: 'INDEX SECURITIES LIMITED' },
  { id: 61, broker_no: '70', broker_name: 'Infinity Securities Limited' },
  { id: 62, broker_no: '71', broker_name: 'SHUBHAKAMANA SECURITIES PVT. LTD' },
  { id: 63, broker_no: '72', broker_name: 'Hatemalo Financial Services Private Limited' },
  { id: 64, broker_no: '73', broker_name: 'Money World Share Exchange PVT Ltd' },
  { id: 65, broker_no: '74', broker_name: 'KALASH STOCK MARKET PVT. LTD' },
  { id: 66, broker_no: '75', broker_name: 'Mega Stock Markets Limited' },
  { id: 67, broker_no: '76', broker_name: 'Machhapuchchhre Securities Limited' },
  { id: 68, broker_no: '77', broker_name: 'Nabil Securities Ltd' },
  { id: 69, broker_no: '78', broker_name: 'Garima Securities Limited' },
  { id: 70, broker_no: '79', broker_name: 'pahiinvestment' },
  { id: 71, broker_no: '80', broker_name: 'Indira securities pvt. ltd' },
  { id: 72, broker_no: '81', broker_name: 'Aakashbhairab Securities Ltd.' },
  { id: 73, broker_no: '82', broker_name: 'N.M.B. SECURITIES LIMITED' },
  { id: 74, broker_no: '83', broker_name: 'Sanima Securities Limited' },
  { id: 75, broker_no: '84', broker_name: 'MILKY WAY SHARE BROKER COMPANY LTD' },
  { id: 76, broker_no: '85', broker_name: 'Capital Hub P. Ltd' },
  { id: 77, broker_no: '86', broker_name: 'Stoxkarts Securities Limited' },
  { id: 78, broker_no: '87', broker_name: 'S.P.S.A. Securities Limited' },
  { id: 79, broker_no: '88', broker_name: 'Blue Chip Securities Ltd' },
  { id: 80, broker_no: '89', broker_name: 'JBNL Securities ltd' },
  { id: 81, broker_no: '90', broker_name: 'Sajilo Broker Limited' },
  { id: 82, broker_no: '91', broker_name: 'C.B.I.L. Securities Limited' },
  { id: 83, broker_no: '92', broker_name: 'Roadshow securities limited' },
  { id: 84, broker_no: '93', broker_name: 'Beni Securities Pvt.Ltd.' },
  { id: 85, broker_no: '94', broker_name: 'K.B.L. Securities Limited' },
  { id: 86, broker_no: '95', broker_name: 'Magnet Securities and Investment Company Private Limited' },
  { id: 87, broker_no: '96', broker_name: 'Himalayan Securities Limited' },
  { id: 88, broker_no: '97', broker_name: 'R.B.B. Securities Company Ltd' },
  { id: 89, broker_no: '98', broker_name: 'Trademow Securities Private Limited' },
  { id: 90, broker_no: '99', broker_name: 'Prabhu Stock Market Limited' },
  { id: 91, broker_no: '100', broker_name: 'Sunrise Securities Limited' },
  { id: 92, broker_no: '101', broker_name: 'APPLE SECURITIES PRIVATE LIMITED' },
]

const BROKER_BY_NO: Record<string, BrokerDirectoryEntry> = Object.fromEntries(
  BROKER_DIRECTORY.map((entry) => [entry.broker_no, entry])
)

/** Returns the registered broker name for a broker number, if known. */
export function getBrokerName(brokerNo: string): string | undefined {
  return BROKER_BY_NO[brokerNo]?.broker_name
}

/** Returns "Broker Name (#no)", falling back to "Broker #no" if the broker isn't in the directory. */
export function getBrokerLabel(brokerNo: string): string {
  const name = getBrokerName(brokerNo)
  return name ? `${name} (#${brokerNo})` : `Broker #${brokerNo}`
}
