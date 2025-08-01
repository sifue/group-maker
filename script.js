// グループ分けツールのメインJavaScript

class GroupMaker {
    constructor() {
        this.history = this.loadHistory();
        this.currentMembers = [];
        this.initializeEventListeners();
    }

    // イベントリスナーの初期化
    initializeEventListeners() {
        const createBtn = document.getElementById('createGroupsBtn');
        createBtn.addEventListener('click', () => this.createGroups());

        const memberInput = document.getElementById('memberInput');
        memberInput.addEventListener('input', () => this.updateMemberList());

        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        clearHistoryBtn.addEventListener('click', () => this.clearHistory());
    }

    // メンバーリストの更新
    updateMemberList() {
        const input = document.getElementById('memberInput').value;
        this.currentMembers = input.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
    }

    // Web Storageから履歴の読み込み
    loadHistory() {
        try {
            const stored = localStorage.getItem('groupMakerHistory');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('履歴の読み込みに失敗しました:', error);
            return {};
        }
    }

    // Web Storageに履歴の保存
    saveHistory() {
        try {
            localStorage.setItem('groupMakerHistory', JSON.stringify(this.history));
        } catch (error) {
            console.error('履歴の保存に失敗しました:', error);
            alert('履歴の保存に失敗しました。ストレージ容量を確認してください。');
        }
    }

    // 履歴の削除
    clearHistory() {
        if (this.currentMembers.length === 0) {
            alert('メンバーを入力してから履歴を削除してください。');
            return;
        }

        const confirmed = confirm('現在のメンバー構成の履歴を削除しますか？\nこの操作は取り消せません。');
        if (!confirmed) {
            return;
        }

        const memberKey = this.getMemberListKey(this.currentMembers);
        if (this.history[memberKey]) {
            delete this.history[memberKey];
            this.saveHistory();
            this.displayHistory();
            alert('履歴が削除されました。');
        } else {
            alert('削除する履歴がありません。');
        }
    }

    // メンバーリストのキーを生成
    getMemberListKey(members) {
        return members.slice().sort().join(',');
    }

    // 特定のメンバーリストの履歴を取得
    getHistoryForMembers(members) {
        const key = this.getMemberListKey(members);
        if (!this.history[key]) {
            this.history[key] = {
                sessions: [],
                pairCounts: this.initializePairCounts(members)
            };
        }
        return this.history[key];
    }

    // ペア数のカウンターを初期化
    initializePairCounts(members) {
        const pairCounts = {};
        for (let i = 0; i < members.length; i++) {
            for (let j = i + 1; j < members.length; j++) {
                const pair = [members[i], members[j]].sort().join('-');
                pairCounts[pair] = 0;
            }
        }
        return pairCounts;
    }

    // グループ分けの実行
    createGroups() {
        this.updateMemberList();
        
        if (this.currentMembers.length < 2) {
            alert('最低2人のメンバーが必要です。');
            return;
        }

        const groupCount = parseInt(document.getElementById('groupCount').value);
        if (groupCount > this.currentMembers.length) {
            alert('グループ数がメンバー数を超えています。');
            return;
        }

        const memberHistory = this.getHistoryForMembers(this.currentMembers);
        const groups = this.assignGroups(this.currentMembers, groupCount, memberHistory);
        
        // 履歴を更新
        this.updateHistory(this.currentMembers, groups);
        
        // 結果を表示
        this.displayGroups(groups);
        this.displayHistory();
    }

    // グループ分けアルゴリズム
    assignGroups(members, groupCount, memberHistory) {
        const isFirstTime = memberHistory.sessions.length === 0;
        
        if (isFirstTime) {
            // 初回は完全ランダム
            return this.randomAssignment(members, groupCount);
        } else {
            // 履歴を考慮したアルゴリズム
            return this.historyAwareAssignment(members, groupCount, memberHistory);
        }
    }

    // ランダムなグループ分け
    randomAssignment(members, groupCount) {
        const shuffled = [...members].sort(() => Math.random() - 0.5);
        const groups = Array.from({ length: groupCount }, () => []);
        
        shuffled.forEach((member, index) => {
            groups[index % groupCount].push(member);
        });

        return groups;
    }

    // 履歴を考慮したグループ分け
    historyAwareAssignment(members, groupCount, memberHistory) {
        const groups = Array.from({ length: groupCount }, () => []);
        const unassigned = [...members];
        
        // 各メンバーについて、過去同じグループになった回数を計算
        const memberPairCounts = {};
        members.forEach(member => {
            memberPairCounts[member] = {};
            members.forEach(otherMember => {
                if (member !== otherMember) {
                    const pair = [member, otherMember].sort().join('-');
                    memberPairCounts[member][otherMember] = memberHistory.pairCounts[pair] || 0;
                }
            });
        });

        // まず、一度も同じグループになったことがない人同士でグループを作る
        let currentGroupIndex = 0;
        
        while (unassigned.length > 0) {
            let bestMember = null;
            let lowestConflictScore = Infinity;

            // 各未配置メンバーについて、現在のグループに入った場合の競合スコアを計算
            for (const member of unassigned) {
                let conflictScore = 0;
                
                // 現在のグループの他のメンバーとの過去の組み合わせ回数を合計
                for (const groupMember of groups[currentGroupIndex]) {
                    conflictScore += memberPairCounts[member][groupMember];
                }

                if (conflictScore < lowestConflictScore) {
                    lowestConflictScore = conflictScore;
                    bestMember = member;
                }
            }

            // 最も競合の少ないメンバーをグループに追加
            if (bestMember) {
                groups[currentGroupIndex].push(bestMember);
                unassigned.splice(unassigned.indexOf(bestMember), 1);
            }

            // 次のグループに移動（ラウンドロビン方式）
            currentGroupIndex = (currentGroupIndex + 1) % groupCount;
        }

        return groups;
    }

    // 履歴の更新
    updateHistory(members, groups) {
        const memberHistory = this.getHistoryForMembers(members);
        
        // セッション情報を追加
        const session = {
            date: new Date().toISOString(),
            groups: groups.map((group, index) => ({
                name: `グループ${index + 1}`,
                members: [...group]
            }))
        };
        memberHistory.sessions.push(session);

        // ペアカウントを更新
        groups.forEach(group => {
            for (let i = 0; i < group.length; i++) {
                for (let j = i + 1; j < group.length; j++) {
                    const pair = [group[i], group[j]].sort().join('-');
                    memberHistory.pairCounts[pair]++;
                }
            }
        });

        this.saveHistory();
    }

    // グループ結果の表示
    displayGroups(groups) {
        const container = document.getElementById('groupResults');
        container.innerHTML = '';

        groups.forEach((group, index) => {
            if (group.length === 0) return;

            const groupDiv = document.createElement('div');
            groupDiv.className = 'bg-white rounded-xl p-4 border-2 border-cappuccino';
            
            // 過去のペア数を計算
            const memberHistory = this.getHistoryForMembers(this.currentMembers);
            let pastPairCount = 0;
            let totalPairs = 0;
            
            for (let i = 0; i < group.length; i++) {
                for (let j = i + 1; j < group.length; j++) {
                    totalPairs++;
                    const pair = [group[i], group[j]].sort().join('-');
                    if (memberHistory.pairCounts[pair] > 1) {
                        pastPairCount++;
                    }
                }
            }

            groupDiv.innerHTML = `
                <h4 class="text-espresso font-medium text-lg mb-2 font-playfair">
                    🎭 グループ${index + 1}
                </h4>
                <div class="space-y-1 mb-3">
                    ${group.map(member => 
                        `<span class="inline-block bg-amber-100 text-espresso px-3 py-1 rounded-full text-sm mr-2 mb-1">${member}</span>`
                    ).join('')}
                </div>
                <p class="text-sm text-gray-600">
                    過去同グループ経験: ${pastPairCount}/${totalPairs}ペア
                </p>
            `;
            
            container.appendChild(groupDiv);
        });
    }

    // 履歴の表示
    displayHistory() {
        const container = document.getElementById('historyContainer');
        const memberHistory = this.getHistoryForMembers(this.currentMembers);
        
        if (memberHistory.sessions.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4 italic">履歴はまだありません</p>';
            return;
        }

        container.innerHTML = '';
        
        // 最新の5セッションを表示
        const recentSessions = memberHistory.sessions.slice(-5).reverse();
        
        recentSessions.forEach((session, index) => {
            const sessionDiv = document.createElement('div');
            sessionDiv.className = 'bg-white rounded-xl p-4 border border-cappuccino';
            
            const date = new Date(session.date);
            const dateStr = date.toLocaleDateString('ja-JP') + ' ' + date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
            
            sessionDiv.innerHTML = `
                <h5 class="text-espresso font-medium mb-2">
                    📅 ${dateStr} (${memberHistory.sessions.length - index}回目)
                </h5>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    ${session.groups.map(group => `
                        <div class="bg-amber-50 rounded-lg p-2">
                            <div class="text-sm font-medium text-espresso mb-1">${group.name}</div>
                            <div class="text-xs text-gray-600">
                                ${group.members.join(', ')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            container.appendChild(sessionDiv);
        });
    }
}

// ページ読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
    new GroupMaker();
});