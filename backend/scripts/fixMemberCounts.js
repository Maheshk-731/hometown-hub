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