// Mock file for the 'ogl' package to prevent Jest from crashing on WebGL syntax during tests.
module.exports = {
  Renderer: jest.fn(),
  Camera: jest.fn(),
  Transform: jest.fn(),
  Program: jest.fn(),
  Mesh: jest.fn(),
  Color: jest.fn(),
  Vec3: jest.fn(),
  Polyline: jest.fn(),
};
