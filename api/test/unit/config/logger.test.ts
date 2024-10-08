// logger.test.ts

import winston from 'winston';
import logger from '@src/config/logger';


describe('Logger Module', () => {
    let consoleTransport: winston.transports.ConsoleTransportInstance;
    let fileTransport: winston.transports.FileTransportInstance;
  
    beforeAll(() => {
      // Find the transports once and ensure they are defined
      const transports = logger.transports;
  
      const foundConsoleTransport = transports.find(
        (transport): transport is winston.transports.ConsoleTransportInstance =>
          transport instanceof winston.transports.Console
      );
      const foundFileTransport = transports.find(
        (transport): transport is winston.transports.FileTransportInstance =>
          transport instanceof winston.transports.File
      );
  
      if (!foundConsoleTransport || !foundFileTransport) {
        throw new Error('Required transports not found');
      }
  
      consoleTransport = foundConsoleTransport;
      fileTransport = foundFileTransport;
    });
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should have the correct logging level', () => {
      expect(logger.level).toBe('info');
    });
  
    it('should have the correct format combining timestamp and json', () => {
      const infoMessage = { level: 'info', message: 'Test message' };
      const formattedMessage = logger.format.transform(infoMessage);
  
      expect(formattedMessage).toHaveProperty('timestamp');
      expect(formattedMessage).toHaveProperty('level', 'info');
      expect(formattedMessage).toHaveProperty('message', 'Test message');
    });
  
    it('should have console and file transports', () => {
      expect(consoleTransport).toBeDefined();
      expect(fileTransport).toBeDefined();
    });
  
    it('should configure console transport with simple format', () => {
      expect(consoleTransport.format).toEqual(winston.format.simple());
    });
  
    it('should configure file transport with filename "combined.log"', () => {
      expect(fileTransport.filename).toBe('combined.log');
    });
  
    it('should log messages at info level to both transports', () => {
      jest.spyOn(consoleTransport, 'log').mockImplementation((info, next) => next());
      jest.spyOn(fileTransport, 'log').mockImplementation((info, next) => next());
  
      logger.info('Test info message');
  
      expect(consoleTransport.log).toHaveBeenCalledTimes(1);
      expect(fileTransport.log).toHaveBeenCalledTimes(1);
  
      jest.restoreAllMocks();
    });
  
    it('should not log debug messages (since level is info)', () => {
      jest.spyOn(consoleTransport, 'log').mockImplementation((info, next) => next());
      jest.spyOn(fileTransport, 'log').mockImplementation((info, next) => next());
  
      logger.debug('Test debug message');
  
      expect(consoleTransport.log).not.toHaveBeenCalled();
      expect(fileTransport.log).not.toHaveBeenCalled();
  
      jest.restoreAllMocks();
    });
  
    it('should log error messages to both transports', () => {
      jest.spyOn(consoleTransport, 'log').mockImplementation((info, next) => next());
      jest.spyOn(fileTransport, 'log').mockImplementation((info, next) => next());
  
      const error = new Error('Test error');
      logger.error('An error occurred', { error });
  
      expect(consoleTransport.log).toHaveBeenCalledTimes(1);
      expect(fileTransport.log).toHaveBeenCalledTimes(1);
  
      jest.restoreAllMocks();
    });
  
    it('should format messages correctly with timestamp and json', () => {
        const infoMessage = { level: 'info', message: 'Test message' };
        const formattedMessage = logger.format.transform(infoMessage);
      
        if (formattedMessage === false) {
          throw new Error('Formatted message is false');
        }
      
        expect(formattedMessage).toHaveProperty('level', 'info');
        expect(formattedMessage).toHaveProperty('message', 'Test message');
        expect(formattedMessage).toHaveProperty('timestamp');
      });
      
  });