const { validationResult } = require('express-validator');

/**
 * validate(validations)
 * Runs an array of express-validator chains and returns 400 on first failure.
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) break;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    next();
  };
};

module.exports = validate;
