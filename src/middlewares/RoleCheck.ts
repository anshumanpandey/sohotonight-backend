import guard from 'express-jwt-permissions'

export const RoleCheck = (required: string | string[] | string[][]) => guard({ permissionsProperty: "role" }).check(required)