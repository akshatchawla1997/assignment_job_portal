const { execute } = require("../config/database/querywrapperMysql"); // Database connection utility
const { v4: uuidv4 } = require("uuid");

class JobService {
  // Create a new job
  async createJob(jobData) {
    try {
      const jobId = uuidv4();
      const query = `
        INSERT INTO jobs (id, title, description, user_id) 
        VALUES (?, ?, ?, ?)
      `;
      const result = await execute(query, [
        jobId,
        jobData.title,
        jobData.description,
        jobData.user_id,
      ]);

      if (result.affectedRows > 0) {
        return {
          status: 201,
          success: true,
          message: "Job created successfully",
          data: { jobId, ...jobData },
        };
      } else {
        throw new Error("Failed to create job");
      }
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: `Error occurred while creating job: ${error.message}`,
      };
    }
  }

  // Fetch all jobs
  async getAllJobs() {
    try {
      const query = `SELECT * FROM jobs`;
      const jobs = await execute(query);

      return {
        status: 200,
        success: true,
        data: jobs,
        message: "Jobs fetched successfully",
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: `Error occurred while fetching jobs: ${error.message}`,
      };
    }
  }

  // Fetch jobs posted by a specific recruiter (user_id)
  async getJobsByRecruiter(userId) {
    try {
      const query = `SELECT * FROM jobs WHERE user_id = ?`;
      const jobs = await execute(query, [userId]);

      return {
        status: 200,
        success: true,
        data: jobs,
        message: "Jobs fetched successfully",
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: `Error occurred while fetching recruiter's jobs: ${error.message}`,
      };
    }
  }

  // Delete a job by ID
  async deleteJob(jobId, userId) {
    try {
      const query = `DELETE FROM jobs WHERE id = ? AND user_id = ?`;
      const result = await execute(query, [jobId, userId]);

      if (result.affectedRows > 0) {
        return {
          status: 200,
          success: true,
          message: "Job deleted successfully",
        };
      } else {
        return {
          status: 404,
          success: false,
          message: "Job not found or unauthorized action",
        };
      }
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: `Error occurred while deleting job: ${error.message}`,
      };
    }
  }

  async applyToJob(candidateId, jobId) {
    return new Promise(async (resolve, reject) => {
        try {
            // First, check if the job exists
            const jobQuery = "SELECT * FROM jobs WHERE id = ?";
            const job = await execute(jobQuery, [jobId]);
            if (job.length === 0) {
                return reject({ status: 404, message: "Job not found" });
            }

            // Check if the candidate has already applied to the job
            const checkExistingApplicationQuery = "SELECT * FROM job_applications WHERE candidate_id = ? AND job_id = ?";
            const existingApplication = await execute(checkExistingApplicationQuery, [candidateId, jobId]);
            if (existingApplication.length > 0) {
                return reject({ status: 400, message: "You have already applied to this job" });
            }

            // Insert the application into the job_applications table
            const insertApplicationQuery = "INSERT INTO job_applications (job_id, candidate_id) VALUES (?, ?)";
            const result = await execute(insertApplicationQuery, [jobId, candidateId]);

            if (result.affectedRows > 0) {
                // Send email to both candidate and recruiter
                const candidateEmailQuery = "SELECT email FROM users WHERE id = ?";
                const candidateEmailResult = await execute(candidateEmailQuery, [candidateId]);
                const candidateEmail = candidateEmailResult[0].email;

                const recruiterEmailQuery = "SELECT u.email FROM users u JOIN jobs j ON u.id = j.user_id WHERE j.id = ?";
                const recruiterEmailResult = await execute(recruiterEmailQuery, [jobId]);
                const recruiterEmail = recruiterEmailResult[0].email;

                // Sending emails to candidate and recruiter
                const jobTitle = job[0].title;
                const emailSubject = `Job Application for ${jobTitle}`;
                const candidateMessage = `Dear Candidate, you have successfully applied for the job: ${jobTitle}.`;
                const recruiterMessage = `Dear Recruiter, a candidate has applied for your job: ${jobTitle}.`;

                await sendEmail(candidateEmail, emailSubject, candidateMessage);
                await sendEmail(recruiterEmail, emailSubject, recruiterMessage);

                return resolve({ status: 201, message: "Application successful and emails sent" });
            } else {
                return reject({ status: 500, message: "Failed to apply for the job" });
            }
        } catch (error) {
            return reject({ status: 500, message: "Internal server error", error });
        }
    });
}
async getJobsAppliedByCandidate(candidateId) {
    return new Promise(async (resolve, reject) => {
      const query = `
        SELECT j.id, j.title, j.description, j.created_at
        FROM job_applications ja
        JOIN jobs j ON ja.job_id = j.id
        WHERE ja.candidate_id = ?`; // Fetch jobs applied by the candidate

      try {
        const result = await execute(query, [candidateId]);
        if (result.length > 0) {
          return resolve({
            status: 200,
            success: true,
            data: result,
            message: "Jobs fetched successfully",
          });
        } else {
          return resolve({
            status: 204,
            success: false,
            message: "No jobs found for this candidate",
          });
        }
      } catch (error) {
        return reject({
          status: 500,
          success: false,
          message: "Internal server error",
        });
      }
    });
  }
}

module.exports = new JobService();
