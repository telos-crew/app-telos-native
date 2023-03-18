// @ts-nocheck
import { BallotComment } from '../types/blockchain';

export const buildCommentTree = (comments: BallotComment[]) => {
	let commentMap = {};
	let level: null | number = null;
	comments.forEach((comment) => {
		console.log(comment.id);
		if (comment.parent_id === null) {
			commentMap[comment.id] = {
				...commentMap[comment.id],
				...comment
			};
		} else {
			// if parent already exists
			if (commentMap[comment.parent_id]) {
				commentMap[comment.parent_id] = {
					...commentMap[comment.parent_id],
					children: {
						...commentMap[comment.parent_id].children,
						[comment.id]: comment
					}
				};
			} else {
				// if parent does not exist
				commentMap[comment.parent_id] = {
					id: comment.parent_id,
					children: {
						[comment.id]: comment
					}
				};
			}
		}
		console.log('commentMap', JSON.stringify(commentMap));
		console.log('commentMap', commentMap);
	});
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
