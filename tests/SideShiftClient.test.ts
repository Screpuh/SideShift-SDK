import { SideShiftClient } from '../src/SideShiftClient';

describe('SideShiftClient', () => {
    let sideShiftClient: SideShiftClient;

    beforeEach(() => {
        sideShiftClient = new SideShiftClient('your-account-id', 'your-api-privatekey');
    });

    test('should create an instance of ApiClient', () => {
        expect(sideShiftClient).toBeInstanceOf(SideShiftClient);
    });
});
