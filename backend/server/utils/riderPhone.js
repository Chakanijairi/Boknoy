/** Digits only, for matching login / uniqueness. */
function riderPhoneDigits(phone) {
  return String(phone ?? '').replace(/\D/g, '');
}

module.exports = { riderPhoneDigits };
