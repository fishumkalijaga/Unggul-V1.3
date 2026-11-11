/* Reset only automatic-review results; protect manual decisions and profile.
   Original FED file bytes are never saved here. Copyright © [2026] ramalabs. */
(function(global){'use strict';
function resetRecommendation(state){
  if(!state||typeof state!=='object')throw Error('Data asesmen tidak valid.');
  return {...state,autoReview:null,discussionNotes:{}};
}
function canRerun(source){
 return Boolean(source&&typeof source==='object'&&source.candidates&&source.name);
}
global.FedReviewCycle={resetRecommendation,canRerun};
})(typeof window!=='undefined'?window:globalThis);
