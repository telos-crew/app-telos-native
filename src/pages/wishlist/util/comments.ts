// @ts-nocheck
import { BallotComment } from '../types/blockchain';

export const buildCommentTree = (comments: BallotComment[]) => {
	let iterator = 0;
	const levels = {};
	const commentMap = {};
	comments.forEach((comment) => {
		if (!levels[comment.level]) {
			levels[comment.level] = {};
		}
		levels[comment.level][comment.id] = comment;
	});
	console.log('levels before', JSON.parse(JSON.stringify(levels)));
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
			console.log('parentLevel final: ', parentLevel);
		}
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
