
function CustomError(name, message) {
  const error = Error(message);
  error.name = name;
  return error;
}

module.exports = CustomError;
