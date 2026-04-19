/** Loose UUID match for Postgres gen_random_uuid() ids */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(param) {
  return typeof param === 'string' && UUID_RE.test(param);
}

module.exports = { isUuid };
