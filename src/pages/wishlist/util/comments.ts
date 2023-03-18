// @ts-nocheck
import { BallotComment } from '../types/blockchain';

export const buildCommentTree = (comments: BallotComment[]) => {
	let commentMap = {};
	let level: null | number = null;
	comments.forEach((comment) => {
		// if it is a new level
		if (level !== comment.level) {
			level = comment.level;
			// if it is top-level
			if (comment.parent_id === null) {
				commentMap[comment.id] = {
					...commentMap[comment.id],
					...comment
				};
			} else {
				// if not top-level
				commentMap[comment.parent_id] = {
					children: {
						[comment.id]: comment
					},
					id: comment.parent_id
				};
			}
		} else {
		}
	});
	console.log('commentMap', commentMap);
};

export const something = {
	99: {
		id: 99
	},
	98: {
		id: 98
	}
};

export const junk = {
	0: {
		id: 0,
		children: {
			8: {
				id: 8,
				children: {}
			}
		}
	},
	1: {
		id: 1,
		children: {
			3: {
				id: 3,
				children: {
					id: 5
				}
			}
		}
	}
};
