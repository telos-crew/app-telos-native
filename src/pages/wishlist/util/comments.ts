// @ts-nocheck
import { BallotComment } from '../types/blockchain';

// comment architecture will have to change if we implement
// pagination, lazy load, or scale to a large number of comments
export const buildCommentTree = (comments: BallotComment[]) => {
	let final;
	const levels = {};
	comments.forEach((comment) => {
		if (!levels[comment.level]) {
			levels[comment.level] = {};
		}
		levels[comment.level][comment.id] = comment;
	});
	const sortedLevelKeys = Object.keys(levels).sort().reverse();
	sortedLevelKeys.forEach((levelKey: string) => {
		const levelComments = levels[levelKey];
		if (levelKey !== '0') {
			// sort comments?
			const parentLevel = levels[parseInt(levelKey) - 1];
			for (const key in levelComments) {
				const comment = levelComments[key];
				if (!parentLevel[comment.parent_id].children) {
					parentLevel[comment.parent_id].children = [comment];
				} else {
					parentLevel[comment.parent_id].children.push(comment);
				}
			}
			final = parentLevel;
		} else {
			final = levelComments;
		}
	});
	console.log('buildCommenTree(): ', final);
	return final;
};
