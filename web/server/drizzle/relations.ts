import { relations } from "drizzle-orm/relations";
import { complaints, complaintAnswers } from "./schema";

export const complaintAnswersRelations = relations(complaintAnswers, ({one}) => ({
	complaint: one(complaints, {
		fields: [complaintAnswers.complaintId],
		references: [complaints.id]
	}),
}));

export const complaintsRelations = relations(complaints, ({many}) => ({
	complaintAnswers: many(complaintAnswers),
}));