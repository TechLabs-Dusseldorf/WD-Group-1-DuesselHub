import { z } from "zod";

const commentSchema = z.object({
  text: z.string().trim().min(1, "Please enter a comment.").max(250, "Too long. Your comment cannot be longer than 250 characters.")
});

export const validateComment = (data) => {
  return commentSchema.safeParse(data);
};