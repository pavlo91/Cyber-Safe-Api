-- CreateIndex
CREATE INDEX "Action_postId_idx" ON "Action"("postId");

-- CreateIndex
CREATE INDEX "Action_userId_idx" ON "Action"("userId");

-- CreateIndex
CREATE INDEX "AnalysisItem_status_idx" ON "AnalysisItem"("status");

-- CreateIndex
CREATE INDEX "AnalysisItem_flagged_idx" ON "AnalysisItem"("flagged");

-- CreateIndex
CREATE INDEX "Post_flagged_idx" ON "Post"("flagged");

-- CreateIndex
CREATE INDEX "Post_manualReview_idx" ON "Post"("manualReview");

-- CreateIndex
CREATE INDEX "User_parentalApproval_idx" ON "User"("parentalApproval");
