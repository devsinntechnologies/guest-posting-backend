"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cacheable = exports.CACHEABLE_KEY = exports.Public = exports.IS_PUBLIC_KEY = exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;
exports.CACHEABLE_KEY = 'cacheable';
const Cacheable = (maxAge = 300) => (0, common_1.SetMetadata)(exports.CACHEABLE_KEY, maxAge);
exports.Cacheable = Cacheable;
//# sourceMappingURL=roles.decorator.js.map