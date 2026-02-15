export function hasRole(member, roleId) {
  return member.roles.cache.has(roleId);
}
