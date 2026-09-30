// HeyGen (avatars, video translate) is wired in the next step. It gets its own
// module so the Studio shell and generations table already have a home for it.
export const hasHeyGen = () => Boolean(process.env.HEYGEN_API_KEY);
