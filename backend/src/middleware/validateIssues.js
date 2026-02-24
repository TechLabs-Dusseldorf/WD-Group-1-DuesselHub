import { z } from "zod";

const issueSchema = z.object({
  title: z.string().trim().min(1, "Please enter a title for your report.").max(40, "Too long. Your title cannot be longer than 40 characters."),

  name: z.string().trim().min(2, "Please enter a name with at least 2 characters.").regex(/^[\p{L}\s'-]+$/u, "Your name cannot have numbers!"),

  description: z.string().trim().min(40, "Too short. Your report must be at least 40 characters long.").max(250, "Too long. Your report cannot be longer than 250 characters."),

  location: z.string().trim().min(1, "Please enter the address where the issue exists.").max(100, "Too long. Your address cannot be longer than 100 characters.")
});

export const validateIssue = (data) => {
  return issueSchema.safeParse(data);
};