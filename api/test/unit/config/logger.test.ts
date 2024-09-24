// import logger from '../../../src/config/logger';
// import winston from 'winston';


// jest.mock('winston', () => {
//     const originalWinston = jest.requireActual('winston');
  
//     // Mock the transports
//     return {
//       ...originalWinston,
//       format: {
//         combine: jest.fn().mockImplementation(() => {}),
//         timestamp: jest.fn().mockImplementation(() => {}),
//         json: jest.fn().mockImplementation(() => {}),
//         simple: jest.fn().mockImplementation(() => {}),
//       },
//       createLogger: jest.fn().mockReturnValue({
//         level: 'info',
//         transports: [
//           new originalWinston.transports.Console(),
//           new originalWinston.transports.File({ filename: 'combined.log' }),
//         ],
//       }),
//       transports: {
//         Console: jest.fn().mockImplementation(() => ({
//           log: jest.fn(),
//         })),
//         File: jest.fn().mockImplementation(() => ({
//           log: jest.fn(),
//         })),
//       },
//     };
//   });
  
//   describe('Logger Configuration', () => {
//     let consoleTransportMock: jest.Mock;
//     let fileTransportMock: jest.Mock;
  
//     beforeAll(() => {
//       // Mock the Winston transport constructors
//       consoleTransportMock = winston.transports.Console as unknown as jest.Mock;
//       fileTransportMock = winston.transports.File as unknown as jest.Mock;
//     });
  
//     afterEach(() => {
//       jest.clearAllMocks();
//     });
  
//     it('should be configured with "info" log level', () => {
//       expect(logger.level).toBe('info');
//     });
  
//     it('should use Console transport with "simple" format', () => {
//       logger; // Ensure logger is instantiated to trigger the transport setup
//       expect(consoleTransportMock).toHaveBeenCalledWith(
//         expect.objectContaining({
//           format: expect.any(Object), // Ensure format is an object
//         })
//       );
//     });
  
//     it('should use File transport for combined.log', () => {
//       logger; // Ensure logger is instantiated to trigger the transport setup
//       expect(fileTransportMock).toHaveBeenCalledWith(
//         expect.objectContaining({
//           filename: 'combined.log',
//         })
//       );
//     });
  
//     it('should have timestamp and JSON formats', () => {
//       const formatCombineSpy = jest.spyOn(winston.format, 'combine');
//       const formatTimestampSpy = jest.spyOn(winston.format, 'timestamp');
//       const formatJsonSpy = jest.spyOn(winston.format, 'json');
  
//       // Recreate logger to ensure formats are applied
//       logger;
  
//       expect(formatCombineSpy).toHaveBeenCalled();
//       expect(formatTimestampSpy).toHaveBeenCalled();
//       expect(formatJsonSpy).toHaveBeenCalled();
//     });
//   });