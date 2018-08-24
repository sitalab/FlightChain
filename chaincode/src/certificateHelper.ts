import {ClientIdentity} from 'fabric-shim';

export class CertificateHelper {

    public static ATTR_IATA_CODE = 'iata-code';

    public static getIataCode(clientIdentity: ClientIdentity): string {
        const iataCode = clientIdentity.getAttributeValue(CertificateHelper.ATTR_IATA_CODE); // .getAttributeValue(CertificateHelper.ATTR_IATA_CODE)
        console.log('CertificateHelper.getIataCode = ', iataCode);
        return iataCode;
    }
}