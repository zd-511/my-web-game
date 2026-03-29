/**
 * 宝石消除游戏
 * 核心游戏逻辑实现
 */

class GemMatch {
    constructor() {
        // 游戏界面元素
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.endScreen = document.getElementById('end-screen');
        this.winScreen = document.getElementById('win-screen');
        this.pauseMenu = document.getElementById('pause-menu');
        this.settingsMenu = document.getElementById('settings-menu');
        this.helpMenu = document.getElementById('help-menu');
        this.gameBoard = document.getElementById('game-board');
        
        // 游戏状态元素
        this.scoreCountElement = document.getElementById('score-count');
        this.movesCountElement = document.getElementById('moves-count');
        this.levelCountElement = document.getElementById('level-count');
        this.targetScoreCountElement = document.getElementById('target-score-count');
        this.comboCountElement = document.getElementById('combo-count');
        this.finalScoreElement = document.getElementById('final-score');
        this.finalLevelElement = document.getElementById('final-level');
        this.finalMovesElement = document.getElementById('final-moves');
        this.winLevelElement = document.getElementById('win-level');
        this.winScoreElement = document.getElementById('win-score');
        this.winMovesElement = document.getElementById('win-moves');
        
        // 按钮元素
        this.startButton = document.getElementById('start-button');
        this.playAgainButton = document.getElementById('play-again-button');
        this.exitButton = document.getElementById('exit-button');
        this.pauseButton = document.getElementById('pause-button');
        this.resumeButton = document.getElementById('resume-button');
        this.pauseRestartButton = document.getElementById('pause-restart-button');
        this.pauseExitButton = document.getElementById('pause-exit-button');
        this.settingsButton = document.getElementById('settings-button');
        this.settingsBackButton = document.getElementById('settings-back-button');
        this.helpButton = document.getElementById('help-button');
        this.helpBackButton = document.getElementById('help-back-button');
        this.nextLevelButton = document.getElementById('next-level-button');
        this.winExitButton = document.getElementById('win-exit-button');
        this.restartButton = document.getElementById('restart-button');
        
        // 设置元素
        this.volumeSlider = document.getElementById('volume-slider');
        this.difficultySelect = document.getElementById('difficulty-select');
        this.startDifficultySelect = document.getElementById('start-difficulty-select');
        
        // 游戏状态
        this.score = 0;
        this.moves = 30;
        this.level = 1;
        this.gameActive = false;
        this.isPaused = false;
        this.selectedGem = null;
        this.board = [];
        this.boardSize = 8;
        this.gemTypes = ['💎', '💖', '💜', '💚', '💙', '💛'];
        this.specialTypes = ['💣', '🌈'];
        this.targetScore = 1000;
        this.difficulty = 'normal';
        this.combo = 0;
        this.comboMultiplier = 1;
        this.specialChance = 0.05;
        
        this.init();
    }
    
    /**
     * 初始化游戏
     */
    init() {
        // 绑定事件
        this.startButton.addEventListener('click', () => this.startGame());
        this.playAgainButton.addEventListener('click', () => this.startGame());
        this.exitButton.addEventListener('click', () => this.exitToMainMenu());
        this.pauseButton.addEventListener('click', () => this.pauseGame());
        this.resumeButton.addEventListener('click', () => this.resumeGame());
        this.pauseRestartButton.addEventListener('click', () => this.startGame());
        this.pauseExitButton.addEventListener('click', () => this.exitToMainMenu());
        this.settingsButton.addEventListener('click', () => this.showSettings());
        this.settingsBackButton.addEventListener('click', () => this.hideSettings());
        this.helpButton.addEventListener('click', () => this.showHelp());
        this.helpBackButton.addEventListener('click', () => this.hideHelp());
        this.nextLevelButton.addEventListener('click', () => this.nextLevel());
        this.winExitButton.addEventListener('click', () => this.exitToMainMenu());
        this.restartButton.addEventListener('click', () => this.startGame());
        
        // 设置事件
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.updateDifficulty();
        });
        
        this.updateDifficulty();
    }
    
    /**
     * 更新难度设置
     */
    updateDifficulty() {
        switch (this.difficulty) {
            case 'easy':
                this.moves = 40;
                this.targetScore = 800;
                break;
            case 'normal':
                this.moves = 30;
                this.targetScore = 1000;
                break;
            case 'hard':
                this.moves = 20;
                this.targetScore = 1200;
                break;
        }
    }
    
    /**
     * 开始游戏
     */
    startGame() {
        // 获取开始界面选择的难度
        if (this.startDifficultySelect) {
            this.difficulty = this.startDifficultySelect.value;
        }
        
        // 重置游戏状态
        this.score = 0;
        this.level = 1;
        this.combo = 0;
        this.comboMultiplier = 1;
        this.updateDifficulty();
        
        // 更新显示
        this.updateScoreDisplay();
        this.updateMovesDisplay();
        this.updateLevelDisplay();
        this.updateTargetScoreDisplay();
        this.updateComboDisplay();
        
        // 初始化游戏板
        this.initializeBoard();
        
        // 切换界面
        this.hideScreen(this.startScreen);
        this.hideScreen(this.endScreen);
        this.hideScreen(this.winScreen);
        this.showScreen(this.gameScreen);
        
        // 开始游戏
        this.gameActive = true;
        this.isPaused = false;
    }
    
    /**
     * 初始化游戏板
     */
    initializeBoard() {
        this.board = [];
        this.gameBoard.innerHTML = '';
        
        // 创建游戏板
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                let gemType;
                do {
                    // 有一定概率生成特殊方块
                    if (Math.random() < this.specialChance && (row > 1 || col > 1)) {
                        gemType = this.specialTypes[Math.floor(Math.random() * this.specialTypes.length)];
                    } else {
                        gemType = this.gemTypes[Math.floor(Math.random() * this.gemTypes.length)];
                    }
                } while (this.checkInitialMatch(row, col, gemType));
                
                this.board[row][col] = gemType;
                this.createGem(row, col, gemType);
            }
        }
    }
    
    /**
     * 检查初始匹配
     */
    checkInitialMatch(row, col, gemType) {
        // 检查水平匹配
        if (col >= 2 && 
            this.board[row][col-1] === gemType && 
            this.board[row][col-2] === gemType) {
            return true;
        }
        
        // 检查垂直匹配
        if (row >= 2 && 
            this.board[row-1][col] === gemType && 
            this.board[row-2][col] === gemType) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 创建宝石
     */
    createGem(row, col, gemType) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        const gem = document.createElement('div');
        gem.className = 'gem';
        gem.textContent = gemType;
        gem.dataset.type = gemType;
        
        cell.appendChild(gem);
        this.gameBoard.appendChild(cell);
        
        // 添加点击事件
        cell.addEventListener('click', () => this.selectGem(row, col));
    }
    
    /**
     * 选择宝石
     */
    selectGem(row, col) {
        if (!this.gameActive || this.isPaused) return;
        
        const cell = this.getCell(row, col);
        
        if (!this.selectedGem) {
            // 第一次选择
            this.selectedGem = { row, col };
            cell.classList.add('selected');
        } else {
            // 第二次选择
            if (this.isAdjacent(this.selectedGem, { row, col })) {
                // 交换宝石
                this.swapGems(this.selectedGem, { row, col });
            } else {
                // 取消选择
                this.getCell(this.selectedGem.row, this.selectedGem.col).classList.remove('selected');
                this.selectedGem = { row, col };
                cell.classList.add('selected');
            }
        }
    }
    
    /**
     * 检查宝石是否相邻
     */
    isAdjacent(gem1, gem2) {
        const rowDiff = Math.abs(gem1.row - gem2.row);
        const colDiff = Math.abs(gem1.col - gem2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
    
    /**
     * 交换宝石
     */
    swapGems(gem1, gem2) {
        // 交换数组中的宝石
        const temp = this.board[gem1.row][gem1.col];
        this.board[gem1.row][gem1.col] = this.board[gem2.row][gem2.col];
        this.board[gem2.row][gem2.col] = temp;
        
        // 更新DOM
        const cell1 = this.getCell(gem1.row, gem1.col);
        const cell2 = this.getCell(gem2.row, gem2.col);
        const gem1Element = cell1.querySelector('.gem');
        const gem2Element = cell2.querySelector('.gem');
        
        // 添加交换动画
        gem1Element.classList.add('animate-swap');
        gem2Element.classList.add('animate-swap');
        
        // 交换内容
        const tempText = gem1Element.textContent;
        gem1Element.textContent = gem2Element.textContent;
        gem1Element.dataset.type = gem2Element.dataset.type;
        gem2Element.textContent = tempText;
        gem2Element.dataset.type = tempText;
        
        // 移除选择状态
        cell1.classList.remove('selected');
        this.selectedGem = null;
        
        // 检查匹配
        setTimeout(() => {
            // 检查所有可能的匹配
            let allMatches = [];
            for (let row = 0; row < this.boardSize; row++) {
                for (let col = 0; col < this.boardSize; col++) {
                    const matches = this.findMatches(row, col);
                    if (matches.length > 0) {
                        allMatches.push(...matches);
                    }
                }
            }
            
            if (allMatches.length > 0) {
                // 有匹配，处理匹配
                this.processMatches(allMatches);
                this.moves--;
                this.updateMovesDisplay();
                this.checkGameStatus();
            } else {
                // 无匹配，交换回来
                this.swapGemsBack(gem1, gem2, gem1Element, gem2Element);
                // 重置连击
                this.combo = 0;
                this.comboMultiplier = 1;
                this.updateComboDisplay();
            }
        }, 300);
    }
    
    /**
     * 交换宝石回来
     */
    swapGemsBack(gem1, gem2, gem1Element, gem2Element) {
        // 交换数组中的宝石
        const temp = this.board[gem1.row][gem1.col];
        this.board[gem1.row][gem1.col] = this.board[gem2.row][gem2.col];
        this.board[gem2.row][gem2.col] = temp;
        
        // 更新DOM
        const tempText = gem1Element.textContent;
        gem1Element.textContent = gem2Element.textContent;
        gem1Element.dataset.type = gem2Element.dataset.type;
        gem2Element.textContent = tempText;
        gem2Element.dataset.type = tempText;
        
        // 添加交换动画
        gem1Element.classList.add('animate-swap');
        gem2Element.classList.add('animate-swap');
        
        // 移除动画类
        setTimeout(() => {
            gem1Element.classList.remove('animate-swap');
            gem2Element.classList.remove('animate-swap');
        }, 300);
    }
    
    /**
     * 查找匹配
     */
    findMatches(row, col) {
        const matches = [];
        const gemType = this.board[row][col];
        
        if (!gemType) return matches;
        
        // 水平匹配
        let horizontalMatches = [{ row, col }];
        
        // 向左查找
        for (let c = col - 1; c >= 0; c--) {
            if (this.board[row][c] === gemType) {
                horizontalMatches.push({ row, col: c });
            } else {
                break;
            }
        }
        
        // 向右查找
        for (let c = col + 1; c < this.boardSize; c++) {
            if (this.board[row][c] === gemType) {
                horizontalMatches.push({ row, col: c });
            } else {
                break;
            }
        }
        
        if (horizontalMatches.length >= 3) {
            matches.push(...horizontalMatches);
        }
        
        // 垂直匹配
        let verticalMatches = [{ row, col }];
        
        // 向上查找
        for (let r = row - 1; r >= 0; r--) {
            if (this.board[r][col] === gemType) {
                verticalMatches.push({ row: r, col });
            } else {
                break;
            }
        }
        
        // 向下查找
        for (let r = row + 1; r < this.boardSize; r++) {
            if (this.board[r][col] === gemType) {
                verticalMatches.push({ row: r, col });
            } else {
                break;
            }
        }
        
        if (verticalMatches.length >= 3) {
            matches.push(...verticalMatches);
        }
        
        return matches;
    }
    
    /**
     * 处理匹配
     */
    processMatches(matches) {
        // 去重
        const uniqueMatches = this.removeDuplicates(matches);
        
        // 检查是否包含特殊方块
        const hasSpecial = uniqueMatches.some(match => 
            this.specialTypes.includes(this.board[match.row][match.col])
        );
        
        // 处理特殊方块
        if (hasSpecial) {
            uniqueMatches.forEach(match => {
                const gemType = this.board[match.row][match.col];
                if (gemType === '💣') {
                    // 炸弹方块：消除周围8个方块
                    this.explodeBomb(match.row, match.col);
                } else if (gemType === '🌈') {
                    // 彩虹方块：消除所有相同类型的方块
                    this.clearSameType(this.board[match.row][match.col]);
                }
            });
        } else {
            // 普通匹配
            // 添加匹配动画
            uniqueMatches.forEach(match => {
                const cell = this.getCell(match.row, match.col);
                const gem = cell.querySelector('.gem');
                gem.classList.add('animate-match');
            });
        }
        
        // 计算分数
        const matchCount = uniqueMatches.length;
        const points = matchCount * 10 * this.comboMultiplier;
        this.score += points;
        this.updateScoreDisplay();
        
        // 显示分数弹出动画
        this.showScorePopup(points);
        
        // 增加连击
        this.combo++;
        this.comboMultiplier = Math.min(1 + Math.floor(this.combo / 3), 3);
        this.updateComboDisplay();
        
        // 增加额外步数
        if (matchCount >= 4) {
            this.moves += 1;
            this.updateMovesDisplay();
        }
        
        // 移除匹配的宝石
        setTimeout(() => {
            uniqueMatches.forEach(match => {
                this.board[match.row][match.col] = null;
                const cell = this.getCell(match.row, match.col);
                cell.innerHTML = '';
            });
            
            // 下落宝石
            this.dropGems();
        }, 500);
    }
    
    /**
     * 处理炸弹方块爆炸
     */
    explodeBomb(row, col) {
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize) {
                    const cell = this.getCell(r, c);
                    if (cell) {
                        const gem = cell.querySelector('.gem');
                        if (gem) {
                            gem.classList.add('animate-explode');
                            setTimeout(() => {
                                this.board[r][c] = null;
                                cell.innerHTML = '';
                            }, 300);
                        }
                    }
                }
            }
        }
    }
    
    /**
     * 处理彩虹方块消除同类型
     */
    clearSameType(gemType) {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === gemType) {
                    const cell = this.getCell(row, col);
                    const gem = cell.querySelector('.gem');
                    if (gem) {
                        gem.classList.add('animate-rainbow');
                        setTimeout(() => {
                            this.board[row][col] = null;
                            cell.innerHTML = '';
                        }, 300);
                    }
                }
            }
        }
    }
    
    /**
     * 更新连击显示
     */
    updateComboDisplay() {
        if (this.comboCountElement) {
            this.comboCountElement.textContent = `${this.combo}x`;
            
            // 添加连击动画效果
            this.comboCountElement.classList.add('combo-animation');
            setTimeout(() => {
                this.comboCountElement.classList.remove('combo-animation');
            }, 500);
        }
        console.log(`Combo: ${this.combo}x`);
    }
    
    /**
     * 显示分数弹出动画
     */
    showScorePopup(points) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        
        // 定位到屏幕中央
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.fontSize = '24px';
        popup.style.fontWeight = 'bold';
        popup.style.pointerEvents = 'none';
        popup.style.zIndex = '1000';
        popup.style.animation = 'scorePopup 1s ease-out forwards';
        
        document.body.appendChild(popup);
        
        // 动画结束后移除
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }
    
    /**
     * 移除重复项
     */
    removeDuplicates(matches) {
        const seen = new Set();
        return matches.filter(match => {
            const key = `${match.row},${match.col}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
    
    /**
     * 下落宝石
     */
    dropGems() {
        // 处理每一列
        for (let col = 0; col < this.boardSize; col++) {
            let emptySpaces = 0;
            
            // 从下往上处理
            for (let row = this.boardSize - 1; row >= 0; row--) {
                if (this.board[row][col] === null) {
                    emptySpaces++;
                } else if (emptySpaces > 0) {
                    // 下移宝石
                    this.board[row + emptySpaces][col] = this.board[row][col];
                    this.board[row][col] = null;
                }
            }
            
            // 生成新宝石
            for (let row = 0; row < emptySpaces; row++) {
                let gemType;
                // 有一定概率生成特殊方块
                if (Math.random() < this.specialChance) {
                    gemType = this.specialTypes[Math.floor(Math.random() * this.specialTypes.length)];
                } else {
                    gemType = this.gemTypes[Math.floor(Math.random() * this.gemTypes.length)];
                }
                this.board[row][col] = gemType;
            }
        }
        
        // 一次性更新DOM
        this.updateBoard();
        
        // 检查新的匹配
        setTimeout(() => {
            let hasMatches = false;
            const allMatches = [];
            
            for (let row = 0; row < this.boardSize; row++) {
                for (let col = 0; col < this.boardSize; col++) {
                    const matches = this.findMatches(row, col);
                    if (matches.length > 0) {
                        hasMatches = true;
                        allMatches.push(...matches);
                    }
                }
            }
            
            if (hasMatches) {
                this.processMatches(allMatches);
            }
        }, 500);
    }
    
    /**
     * 一次性更新游戏板DOM
     */
    updateBoard() {
        // 清空游戏板
        this.gameBoard.innerHTML = '';
        
        // 重新创建所有宝石
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const gemType = this.board[row][col];
                if (gemType) {
                    const cell = document.createElement('div');
                    cell.className = 'grid-cell';
                    cell.dataset.row = row;
                    cell.dataset.col = col;
                    
                    const gem = document.createElement('div');
                    gem.className = 'gem animate-fall';
                    gem.textContent = gemType;
                    gem.dataset.type = gemType;
                    
                    cell.appendChild(gem);
                    this.gameBoard.appendChild(cell);
                    
                    // 添加点击事件
                    cell.addEventListener('click', () => this.selectGem(row, col));
                }
            }
        }
    }
    
    /**
     * 检查游戏状态
     */
    checkGameStatus() {
        if (this.moves <= 0) {
            // 步数用完，游戏结束
            this.endGame(false);
        } else if (this.score >= this.targetScore) {
            // 达到目标分数，胜利
            this.endGame(true);
        }
    }
    
    /**
     * 结束游戏
     */
    endGame(victory) {
        this.gameActive = false;
        
        if (victory) {
            // 胜利界面
            this.winLevelElement.textContent = this.level;
            this.winScoreElement.textContent = this.score;
            this.winMovesElement.textContent = this.moves;
            this.hideScreen(this.gameScreen);
            this.showScreen(this.winScreen);
        } else {
            // 失败界面
            this.finalScoreElement.textContent = this.score;
            this.finalLevelElement.textContent = this.level;
            this.finalMovesElement.textContent = this.moves;
            this.hideScreen(this.gameScreen);
            this.showScreen(this.endScreen);
        }
    }
    
    /**
     * 下一关
     */
    nextLevel() {
        this.level++;
        this.score = 0;
        this.updateDifficulty();
        this.targetScore = Math.floor(this.targetScore * 1.5);
        
        // 更新显示
        this.updateScoreDisplay();
        this.updateMovesDisplay();
        this.updateLevelDisplay();
        this.updateTargetScoreDisplay();
        
        // 初始化游戏板
        this.initializeBoard();
        
        // 切换界面
        this.hideScreen(this.winScreen);
        this.showScreen(this.gameScreen);
        
        // 开始游戏
        this.gameActive = true;
    }
    
    /**
     * 暂停游戏
     */
    pauseGame() {
        if (!this.gameActive) return;
        
        this.isPaused = true;
        this.hideScreen(this.gameScreen);
        this.showScreen(this.pauseMenu);
    }
    
    /**
     * 恢复游戏
     */
    resumeGame() {
        if (!this.isPaused) return;
        
        this.isPaused = false;
        this.hideScreen(this.pauseMenu);
        this.showScreen(this.gameScreen);
    }
    
    /**
     * 返回主菜单
     */
    exitToMainMenu() {
        this.hideScreen(this.gameScreen);
        this.hideScreen(this.endScreen);
        this.hideScreen(this.winScreen);
        this.hideScreen(this.pauseMenu);
        this.hideScreen(this.settingsMenu);
        this.hideScreen(this.helpMenu);
        this.showScreen(this.startScreen);
    }
    
    /**
     * 显示设置菜单
     */
    showSettings() {
        this.hideScreen(this.startScreen);
        this.showScreen(this.settingsMenu);
    }
    
    /**
     * 隐藏设置菜单
     */
    hideSettings() {
        this.hideScreen(this.settingsMenu);
        this.showScreen(this.startScreen);
    }
    
    /**
     * 显示帮助菜单
     */
    showHelp() {
        this.hideScreen(this.startScreen);
        this.showScreen(this.helpMenu);
    }
    
    /**
     * 隐藏帮助菜单
     */
    hideHelp() {
        this.hideScreen(this.helpMenu);
        this.showScreen(this.startScreen);
    }
    
    /**
     * 获取指定位置的单元格
     */
    getCell(row, col) {
        return document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
    }
    
    /**
     * 更新分数显示
     */
    updateScoreDisplay() {
        this.scoreCountElement.textContent = this.score;
    }
    
    /**
     * 更新步数显示
     */
    updateMovesDisplay() {
        this.movesCountElement.textContent = this.moves;
    }
    
    /**
     * 更新关卡显示
     */
    updateLevelDisplay() {
        this.levelCountElement.textContent = this.level;
    }
    
    /**
     * 更新目标分数显示
     */
    updateTargetScoreDisplay() {
        this.targetScoreCountElement.textContent = this.targetScore;
    }
    
    /**
     * 显示界面
     */
    showScreen(screen) {
        screen.classList.add('active');
    }
    
    /**
     * 隐藏界面
     */
    hideScreen(screen) {
        screen.classList.remove('active');
    }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new GemMatch();
});