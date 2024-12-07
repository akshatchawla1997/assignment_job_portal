const crypto = require('../common/crypto');
const JobsService = require('../services/JobsService');
class JobsController {
    // Get all jobs
    async getAllJobs(req, res, next) {
        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader) {
                return res.status(401).json({ success: false, message: 'Authorization header missing' });
            }
            const result = await JobsService.getAllJobs();
            return result.success 
                ? res.status(result.status).json(result) 
                : res.status(result.status).json(result);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ success: false, message: 'Internal server error', error: e });
        } finally {
            next();
        }
    }

    // Create a new job
    async createNewJob(req, res, next) {
        try {
            const authHeader = req.headers['authorization'];
            let userid = '';
            if (!authHeader) {
                return res.status(401).json({ success: false, message: 'Authorization header missing' });
            }
            const jobData = req.body;
            const result = await JobsService.createJob(jobData, userid);
            return result.success
                ? res.status(result.status).json(result)
                : res.status(result.status).json(result);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ success: false, message: 'Internal server error', error: e });
        } finally {
            next();
        }
    }

    // Update an existing job
    async updateJob(req, res, next) {
        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader) {
                return res.status(401).json({ success: false, message: 'Authorization header missing' });
            }
            const updateData = req.body;
            const result = await JobsService.updateJob(updateData);
            return result.success 
                ? res.status(result.status).json(result) 
                : res.status(result.status).json(result);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ success: false, message: 'Internal server error', error: e });
        } finally {
            next();
        }
    }

    // Delete a job
    async deleteJob(req, res, next) {
        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader) {
                return res.status(401).json({ success: false, message: 'Authorization header missing' });
            }
            const id = req.params.id;
            const result = await JobsService.deleteJob(id);
            return result.success 
                ? res.status(result.status).json(result) 
                : res.status(result.status).json(result);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ success: false, message: 'Internal server error', error: e });
        } finally {
            next();
        }
    }
    async applyJob(req, res, next){
        const { candidateId, jobId } = req.body;  // Extract candidateId and jobId from the request body
  
  try {
    const result = await JobsService.applyToJob(candidateId, jobId);  // Call the service function to apply for the job
    
    return res.status(result.status).json(result);  // Send the response back to client
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      success: false,
      message: error.message,
    });
  }
    }
    async viewAppliedJobs(req, res, next) {
        try {
          const authHeader = req.headers['authorization'];
          if (!authHeader) {
            return res.status(401).send('Authorization header missing');
          }
          const candidateId = req.user.id;
          const result = await JobsService.getJobsAppliedByCandidate(candidateId);
    
          return result.success
            ? res.status(200).json(result)
            : res.status(204).json(result);
    
        } catch (error) {
          console.log(error);
          return res.status(500).json({ success: false, message: "Internal server error" });
        } finally {
          next();
        }
      }

      async getJobsByRecruiter(req, res, next){
        try {
            const userId = req.params.userId;  // Extract user_id from request parameters
            const result = await JobsService.getJobsByRecruiter(userId);  // Call the service function
        
            return res.status(result.status).json(result);  // Send the response back to client
          } catch (error) {
            return res.status(500).json({
              status: 500,
              success: false,
              message: `Error occurred: ${error.message}`,
            });
          }
      }
}

module.exports = new JobsController();
