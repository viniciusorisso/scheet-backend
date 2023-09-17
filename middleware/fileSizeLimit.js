const MB = 5;
const FILE_SIZE_LIMIT = MB * 1024 * 1024;

export const fileSizeLimiter = (req, res, next) => {
  const files = req.files;

  const filesOverLimit = [];

  Object.keys(files).forEach((key)=> {
    if (files[key].size > FILE_SIZE_LIMIT) {
      filesOverLimit.push(files[key].name);
    }

    if (filesOverLimit.length) {
      const properVerb = filesOverLimit.length > 1 ? 'are' : 'is';

      const sentence = `Upload failed. ${filesOverLimit.toString()} ${properVerb} over the ${MB}MB limit.`.replace(',', ', ') + ` (${MB}MB)`;
    
      const message = filesOverLimit < 3
        ? sentence.replace(",", " and")
        : sentence.replace(/,([^,]*)$/, ", and");
    
      return res.status(413).json({ status: "error", message });
    }

    next();
  });
};