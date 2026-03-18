import { z } from "zod";

const commentSchema = z.object({
  user: z
    .string()
    .trim()
    .min(1, "A valid user is required.")
    .max(100, "User value is too long."),
  text: z
    .string()
    .trim()
    .min(1, "Please enter a comment.")
    .max(250, "Too long. Your comment cannot be longer than 250 characters.")
});

export const validateComment = (data) => {
  return commentSchema.safeParse(data ?? {});
};