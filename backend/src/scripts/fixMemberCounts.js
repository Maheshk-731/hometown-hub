// One-time fix: recalculates every community's memberCount to match the
// actual number of approved memberships, correcting any drift from past
// testing (joins/leaves that happened before counting was consistent).
//
// Run once from the backend folder with: node scripts/fixMemberCounts.js
// Uses the same MONGO_URI from your .env file, so it fixes whichever
// database that .env points to (local or production Atlas).

require('dotenv').config();
const mongoose = require('mongoose');
const Community = require('../src/models/Community');
const Membership = require('../src/models/Membership');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to database.');

  const communities = await Community.find({});
  console.log(`Found ${communities.length} communities. Recalculating...`);

  for (const community of communities) {
    const actualCount = await Membership.countDocuments({
      community: community._id,
      status: 'approved',
    });

    if (community.memberCount !== actualCount) {
      console.log(
        `  "${community.name}" (${community.slug}): ${community.memberCount} -> ${actualCount}`
      );
      community.memberCount = actualCount;
      await community.save();
    } else {
      console.log(`  "${community.name}" (${community.slug}): already correct (${actualCount})`);
    }
  }

  console.log('Done.');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Error fixing member counts:', err);
  process.exit(1);
});