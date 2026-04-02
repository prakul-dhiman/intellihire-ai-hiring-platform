/* ─── IntelliHire Problem Bank with Test Cases ───────────── */
const problems = [
    {
        id: 1, title: 'Two Sum', d: 'Easy', acc: '57.1%', tags: ['Array', 'Hash Table'], status: 'solved',
        desc: `Given an array of integers **nums** and an integer **target**, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.`,
        examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', exp: 'Because nums[0] + nums[1] == 9' }, { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }, { input: 'nums = [3,3], target = 6', output: '[0,1]' }],
        constraints: ['2 <= nums.length <= 10⁴', '-10⁹ <= nums[i] <= 10⁹', 'Only one valid answer exists.'],
        testCases: [{ input: '[2,7,11,15]\n9', expected: '[0,1]' }, { input: '[3,2,4]\n6', expected: '[1,2]' }, { input: '[3,3]\n6', expected: '[0,1]' }]
    },
    {
        id: 2, title: 'Add Two Numbers', d: 'Medium', acc: '42.8%', tags: ['Linked List', 'Math'], status: 'solved',
        desc: `You are given two non-empty linked lists representing two non-negative integers stored in reverse order. Add the two numbers and return the sum as a linked list.`,
        examples: [{ input: 'l1 = [2,4,3], l2 = [5,6,4]', output: '[7,0,8]', exp: '342 + 465 = 807' }, { input: 'l1 = [0], l2 = [0]', output: '[0]' }],
        constraints: ['Number of nodes in each list is [1,100]', '0 <= Node.val <= 9'],
        testCases: [{ input: '[2,4,3]\n[5,6,4]', expected: '[7,0,8]' }, { input: '[0]\n[0]', expected: '[0]' }, { input: '[9,9,9]\n[1]', expected: '[0,0,0,1]' }]
    },
    {
        id: 3, title: 'Longest Substring Without Repeating Characters', d: 'Medium', acc: '38.5%', tags: ['String', 'Sliding Window', 'Hash Table'], status: 'solved',
        desc: `Given a string **s**, find the length of the longest substring without repeating characters.`,
        examples: [{ input: 's = "abcabcbb"', output: '3', exp: 'The answer is "abc", length 3' }, { input: 's = "bbbbb"', output: '1' }, { input: 's = "pwwkew"', output: '3' }],
        constraints: ['0 <= s.length <= 5 × 10⁴', 's consists of English letters, digits, symbols and spaces.'],
        testCases: [{ input: 'abcabcbb', expected: '3' }, { input: 'bbbbb', expected: '1' }, { input: 'pwwkew', expected: '3' }, { input: '', expected: '0' }]
    },
    {
        id: 4, title: 'Median of Two Sorted Arrays', d: 'Hard', acc: '40.9%', tags: ['Array', 'Binary Search', 'Divide and Conquer'], status: 'attempted',
        desc: `Given two sorted arrays **nums1** and **nums2**, return the median of the two sorted arrays. Overall complexity should be O(log(m+n)).`,
        examples: [{ input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000' }, { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.50000' }],
        constraints: ['0 <= m <= 1000', '0 <= n <= 1000', '1 <= m + n <= 2000'],
        testCases: [{ input: '[1,3]\n[2]', expected: '2.0' }, { input: '[1,2]\n[3,4]', expected: '2.5' }]
    },
    {
        id: 5, title: 'Longest Palindromic Substring', d: 'Medium', acc: '37.3%', tags: ['String', 'Dynamic Programming'], status: 'solved',
        desc: `Given a string **s**, return the longest palindromic substring in s.`,
        examples: [{ input: 's = "babad"', output: '"bab"', exp: '"aba" is also valid' }, { input: 's = "cbbd"', output: '"bb"' }],
        constraints: ['1 <= s.length <= 1000'],
        testCases: [{ input: 'babad', expected: 'bab' }, { input: 'cbbd', expected: 'bb' }, { input: 'a', expected: 'a' }]
    },
    {
        id: 6, title: 'Zigzag Conversion', d: 'Medium', acc: '53.6%', tags: ['String'], status: null,
        desc: `The string "PAYPALISHIRING" is written in a zigzag pattern on a given number of rows. Write the code to read line by line.`,
        examples: [{ input: 's = "PAYPALISHIRING", numRows = 3', output: '"PAHNAPLSIIGYIR"' }],
        constraints: ['1 <= s.length <= 1000', '1 <= numRows <= 1000'],
        testCases: [{ input: 'PAYPALISHIRING\n3', expected: 'PAHNAPLSIIGYIR' }, { input: 'PAYPALISHIRING\n4', expected: 'PINALSIGYAHRPI' }]
    },
    {
        id: 7, title: 'Reverse Integer', d: 'Medium', acc: '31.5%', tags: ['Math'], status: null,
        desc: `Given a signed 32-bit integer **x**, return x with its digits reversed. If reversing causes overflow, return 0.`,
        examples: [{ input: 'x = 123', output: '321' }, { input: 'x = -123', output: '-321' }, { input: 'x = 120', output: '21' }],
        constraints: ['-2³¹ <= x <= 2³¹ - 1'],
        testCases: [{ input: '123', expected: '321' }, { input: '-123', expected: '-321' }, { input: '120', expected: '21' }, { input: '0', expected: '0' }]
    },
    {
        id: 8, title: 'String to Integer (atoi)', d: 'Medium', acc: '20.6%', tags: ['String'], status: null,
        desc: `Implement myAtoi(string s), which converts a string to a 32-bit signed integer.`,
        examples: [{ input: 's = "42"', output: '42' }, { input: 's = "   -42"', output: '-42' }, { input: 's = "4193 with words"', output: '4193' }],
        constraints: ['0 <= s.length <= 200'],
        testCases: [{ input: '42', expected: '42' }, { input: '   -42', expected: '-42' }, { input: '4193 with words', expected: '4193' }]
    },
    {
        id: 9, title: 'Palindrome Number', d: 'Easy', acc: '60.3%', tags: ['Math'], status: 'solved',
        desc: `Given an integer **x**, return true if x is a palindrome, and false otherwise.`,
        examples: [{ input: 'x = 121', output: 'true' }, { input: 'x = -121', output: 'false' }, { input: 'x = 10', output: 'false' }],
        constraints: ['-2³¹ <= x <= 2³¹ - 1'],
        testCases: [{ input: '121', expected: 'true' }, { input: '-121', expected: 'false' }, { input: '10', expected: 'false' }]
    },
    {
        id: 10, title: 'Regular Expression Matching', d: 'Hard', acc: '28.2%', tags: ['String', 'Dynamic Programming', 'Recursion'], status: null,
        desc: `Given input string s and pattern p, implement regular expression matching with support for '.' and '*'.`,
        examples: [{ input: 's = "aa", p = "a"', output: 'false' }, { input: 's = "aa", p = "a*"', output: 'true' }],
        constraints: ['1 <= s.length <= 20', '1 <= p.length <= 20'],
        testCases: [{ input: 'aa\na', expected: 'false' }, { input: 'aa\na*', expected: 'true' }, { input: 'ab\n.*', expected: 'true' }]
    },
    {
        id: 11, title: 'Container With Most Water', d: 'Medium', acc: '55.1%', tags: ['Array', 'Two Pointers', 'Greedy'], status: 'attempted',
        desc: `Given integer array **height** of length n, find two lines forming a container with most water.`,
        examples: [{ input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49' }],
        constraints: ['2 <= n <= 10⁵', '0 <= height[i] <= 10⁴'],
        testCases: [{ input: '[1,8,6,2,5,4,8,3,7]', expected: '49' }, { input: '[1,1]', expected: '1' }]
    },
    {
        id: 13, title: 'Roman to Integer', d: 'Easy', acc: '63.8%', tags: ['Hash Table', 'Math', 'String'], status: 'solved',
        desc: `Given a roman numeral, convert it to an integer.`,
        examples: [{ input: 's = "III"', output: '3' }, { input: 's = "LVIII"', output: '58' }, { input: 's = "MCMXCIV"', output: '1994' }],
        constraints: ['1 <= s.length <= 15'],
        testCases: [{ input: 'III', expected: '3' }, { input: 'LVIII', expected: '58' }, { input: 'MCMXCIV', expected: '1994' }]
    },
    {
        id: 14, title: 'Longest Common Prefix', d: 'Easy', acc: '44.2%', tags: ['String', 'Trie'], status: null,
        desc: `Write a function to find the longest common prefix string amongst an array of strings.`,
        examples: [{ input: 'strs = ["flower","flow","flight"]', output: '"fl"' }, { input: 'strs = ["dog","racecar","car"]', output: '""' }],
        constraints: ['1 <= strs.length <= 200'],
        testCases: [{ input: '["flower","flow","flight"]', expected: 'fl' }, { input: '["dog","racecar","car"]', expected: '' }]
    },
    {
        id: 15, title: '3Sum', d: 'Medium', acc: '35.2%', tags: ['Array', 'Two Pointers', 'Sorting'], status: null,
        desc: `Given integer array nums, return all triplets [nums[i],nums[j],nums[k]] such that they sum to 0.`,
        examples: [{ input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' }],
        constraints: ['3 <= nums.length <= 3000'],
        testCases: [{ input: '[-1,0,1,2,-1,-4]', expected: '[[-1,-1,2],[-1,0,1]]' }, { input: '[0,1,1]', expected: '[]' }, { input: '[0,0,0]', expected: '[[0,0,0]]' }]
    },
    {
        id: 17, title: 'Letter Combinations of a Phone Number', d: 'Medium', acc: '61.2%', tags: ['String', 'Backtracking'], status: null,
        desc: `Given a string containing digits from 2-9, return all possible letter combinations the number could represent.`,
        examples: [{ input: 'digits = "23"', output: '["ad","ae","af","bd","be","bf","cd","ce","cf"]' }],
        constraints: ['0 <= digits.length <= 4'],
        testCases: [{ input: '23', expected: '["ad","ae","af","bd","be","bf","cd","ce","cf"]' }, { input: '', expected: '[]' }]
    },
    {
        id: 19, title: 'Remove Nth Node From End of List', d: 'Medium', acc: '45.3%', tags: ['Linked List', 'Two Pointers'], status: null,
        desc: `Given the head of a linked list, remove the nth node from the end and return its head.`,
        examples: [{ input: 'head = [1,2,3,4,5], n = 2', output: '[1,2,3,5]' }],
        constraints: ['1 <= sz <= 30', '1 <= n <= sz'],
        testCases: [{ input: '[1,2,3,4,5]\n2', expected: '[1,2,3,5]' }, { input: '[1]\n1', expected: '[]' }]
    },
    {
        id: 20, title: 'Valid Parentheses', d: 'Easy', acc: '41.8%', tags: ['String', 'Stack'], status: 'solved',
        desc: `Given a string s containing just '(', ')', '{', '}', '[' and ']', determine if the input string is valid.`,
        examples: [{ input: 's = "()"', output: 'true' }, { input: 's = "()[]{}"', output: 'true' }, { input: 's = "(]"', output: 'false' }],
        constraints: ['1 <= s.length <= 10⁴'],
        testCases: [{ input: '()', expected: 'true' }, { input: '()[]{}', expected: 'true' }, { input: '(]', expected: 'false' }, { input: '([)]', expected: 'false' }]
    },
    {
        id: 21, title: 'Merge Two Sorted Lists', d: 'Easy', acc: '64.1%', tags: ['Linked List', 'Recursion'], status: 'solved',
        desc: `Merge two sorted linked lists into one sorted list by splicing together their nodes.`,
        examples: [{ input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' }],
        constraints: ['Both lists are sorted in non-decreasing order.'],
        testCases: [{ input: '[1,2,4]\n[1,3,4]', expected: '[1,1,2,3,4,4]' }, { input: '[]\n[]', expected: '[]' }]
    },
    {
        id: 23, title: 'Merge k Sorted Lists', d: 'Hard', acc: '52.7%', tags: ['Linked List', 'Divide and Conquer', 'Heap'], status: null,
        desc: `Merge k sorted linked-lists into one sorted linked-list and return it.`,
        examples: [{ input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' }],
        constraints: ['0 <= k <= 10⁴'],
        testCases: [{ input: '[[1,4,5],[1,3,4],[2,6]]', expected: '[1,1,2,3,4,4,5,6]' }, { input: '[]', expected: '[]' }]
    },
    {
        id: 26, title: 'Remove Duplicates from Sorted Array', d: 'Easy', acc: '55.8%', tags: ['Array', 'Two Pointers'], status: null,
        desc: `Remove duplicates in-place from a sorted array so each unique element appears only once. Return the count of unique elements.`,
        examples: [{ input: 'nums = [1,1,2]', output: '2' }, { input: 'nums = [0,0,1,1,1,2,2,3,3,4]', output: '5' }],
        constraints: ['1 <= nums.length <= 3 × 10⁴'],
        testCases: [{ input: '[1,1,2]', expected: '2' }, { input: '[0,0,1,1,1,2,2,3,3,4]', expected: '5' }]
    },
    {
        id: 33, title: 'Search in Rotated Sorted Array', d: 'Medium', acc: '40.9%', tags: ['Array', 'Binary Search'], status: 'attempted',
        desc: `Given a rotated sorted array of distinct values and an integer target, return its index or -1 if not found. Must be O(log n).`,
        examples: [{ input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' }],
        constraints: ['1 <= nums.length <= 5000', 'All values are unique.'],
        testCases: [{ input: '[4,5,6,7,0,1,2]\n0', expected: '4' }, { input: '[4,5,6,7,0,1,2]\n3', expected: '-1' }, { input: '[1]\n0', expected: '-1' }]
    },
    {
        id: 42, title: 'Trapping Rain Water', d: 'Hard', acc: '62.4%', tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'], status: null,
        desc: `Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.`,
        examples: [{ input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' }],
        constraints: ['1 <= n <= 2 × 10⁴', '0 <= height[i] <= 10⁵'],
        testCases: [{ input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expected: '6' }, { input: '[4,2,0,3,2,5]', expected: '9' }]
    },
    {
        id: 46, title: 'Permutations', d: 'Medium', acc: '78.4%', tags: ['Array', 'Backtracking'], status: null,
        desc: `Given an array nums of distinct integers, return all possible permutations in any order.`,
        examples: [{ input: 'nums = [1,2,3]', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' }],
        constraints: ['1 <= nums.length <= 6', 'All integers are unique.'],
        testCases: [{ input: '[1,2,3]', expected: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' }, { input: '[0,1]', expected: '[[0,1],[1,0]]' }]
    },
    {
        id: 49, title: 'Group Anagrams', d: 'Medium', acc: '68.7%', tags: ['Array', 'Hash Table', 'String', 'Sorting'], status: null,
        desc: `Given an array of strings strs, group the anagrams together. Return the answer in any order.`,
        examples: [{ input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }],
        constraints: ['1 <= strs.length <= 10⁴'],
        testCases: [{ input: '["eat","tea","tan","ate","nat","bat"]', expected: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }]
    },
    {
        id: 53, title: 'Maximum Subarray', d: 'Medium', acc: '50.6%', tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'], status: 'solved',
        desc: `Given integer array nums, find the subarray with the largest sum and return its sum.`,
        examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', exp: '[4,-1,2,1] has the largest sum 6' }],
        constraints: ['1 <= nums.length <= 10⁵'],
        testCases: [{ input: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6' }, { input: '[1]', expected: '1' }, { input: '[5,4,-1,7,8]', expected: '23' }]
    },
    {
        id: 55, title: 'Jump Game', d: 'Medium', acc: '38.9%', tags: ['Array', 'Dynamic Programming', 'Greedy'], status: null,
        desc: `Each element represents your max jump length at that position. Return true if you can reach the last index.`,
        examples: [{ input: 'nums = [2,3,1,1,4]', output: 'true' }, { input: 'nums = [3,2,1,0,4]', output: 'false' }],
        constraints: ['1 <= nums.length <= 10⁴'],
        testCases: [{ input: '[2,3,1,1,4]', expected: 'true' }, { input: '[3,2,1,0,4]', expected: 'false' }]
    },
    {
        id: 56, title: 'Merge Intervals', d: 'Medium', acc: '47.8%', tags: ['Array', 'Sorting'], status: null,
        desc: `Given an array of intervals, merge all overlapping intervals.`,
        examples: [{ input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' }],
        constraints: ['1 <= intervals.length <= 10⁴'],
        testCases: [{ input: '[[1,3],[2,6],[8,10],[15,18]]', expected: '[[1,6],[8,10],[15,18]]' }, { input: '[[1,4],[4,5]]', expected: '[[1,5]]' }]
    },
    {
        id: 70, title: 'Climbing Stairs', d: 'Easy', acc: '52.9%', tags: ['Math', 'Dynamic Programming', 'Memoization'], status: 'solved',
        desc: `You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?`,
        examples: [{ input: 'n = 2', output: '2' }, { input: 'n = 3', output: '3' }],
        constraints: ['1 <= n <= 45'],
        testCases: [{ input: '2', expected: '2' }, { input: '3', expected: '3' }, { input: '5', expected: '8' }, { input: '10', expected: '89' }]
    },
    {
        id: 72, title: 'Edit Distance', d: 'Medium', acc: '56.0%', tags: ['String', 'Dynamic Programming'], status: null,
        desc: `Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2 using insert, delete, replace.`,
        examples: [{ input: 'word1 = "horse", word2 = "ros"', output: '3' }],
        constraints: ['0 <= word1.length, word2.length <= 500'],
        testCases: [{ input: 'horse\nros', expected: '3' }, { input: 'intention\nexecution', expected: '5' }]
    },
    {
        id: 76, title: 'Minimum Window Substring', d: 'Hard', acc: '43.7%', tags: ['Hash Table', 'String', 'Sliding Window'], status: null,
        desc: `Given two strings s and t, return the minimum window substring of s such that every character in t is included.`,
        examples: [{ input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' }],
        constraints: ['1 <= s.length, t.length <= 10⁵'],
        testCases: [{ input: 'ADOBECODEBANC\nABC', expected: 'BANC' }, { input: 'a\na', expected: 'a' }, { input: 'a\naa', expected: '' }]
    },
    {
        id: 78, title: 'Subsets', d: 'Medium', acc: '77.0%', tags: ['Array', 'Backtracking', 'Bit Manipulation'], status: null,
        desc: `Given integer array nums of unique elements, return all possible subsets (the power set).`,
        examples: [{ input: 'nums = [1,2,3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' }],
        constraints: ['1 <= nums.length <= 10'],
        testCases: [{ input: '[1,2,3]', expected: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' }, { input: '[0]', expected: '[[],[0]]' }]
    },
    {
        id: 94, title: 'Binary Tree Inorder Traversal', d: 'Easy', acc: '75.9%', tags: ['Stack', 'Tree', 'DFS', 'Binary Tree'], status: 'solved',
        desc: `Given the root of a binary tree, return the inorder traversal of its nodes' values.`,
        examples: [{ input: 'root = [1,null,2,3]', output: '[1,3,2]' }],
        constraints: ['Number of nodes is [0,100].'],
        testCases: [{ input: '[1,null,2,3]', expected: '[1,3,2]' }, { input: '[]', expected: '[]' }, { input: '[1]', expected: '[1]' }]
    },
    {
        id: 98, title: 'Validate Binary Search Tree', d: 'Medium', acc: '33.1%', tags: ['Tree', 'DFS', 'BST'], status: null,
        desc: `Given the root of a binary tree, determine if it is a valid BST.`,
        examples: [{ input: 'root = [2,1,3]', output: 'true' }, { input: 'root = [5,1,4,null,null,3,6]', output: 'false' }],
        constraints: ['Number of nodes is [1,10⁴].'],
        testCases: [{ input: '[2,1,3]', expected: 'true' }, { input: '[5,1,4,null,null,3,6]', expected: 'false' }]
    },
    {
        id: 100, title: 'Same Tree', d: 'Easy', acc: '60.5%', tags: ['Tree', 'DFS', 'BFS'], status: null,
        desc: `Given the roots of two binary trees, check if they are the same or not.`,
        examples: [{ input: 'p = [1,2,3], q = [1,2,3]', output: 'true' }],
        constraints: ['Number of nodes is [0,100].'],
        testCases: [{ input: '[1,2,3]\n[1,2,3]', expected: 'true' }, { input: '[1,2]\n[1,null,2]', expected: 'false' }]
    },
    {
        id: 101, title: 'Symmetric Tree', d: 'Easy', acc: '55.7%', tags: ['Tree', 'DFS', 'BFS'], status: null,
        desc: `Check whether a binary tree is a mirror of itself (symmetric around its center).`,
        examples: [{ input: 'root = [1,2,2,3,4,4,3]', output: 'true' }],
        constraints: ['Number of nodes is [1,1000].'],
        testCases: [{ input: '[1,2,2,3,4,4,3]', expected: 'true' }, { input: '[1,2,2,null,3,null,3]', expected: 'false' }]
    },
    {
        id: 104, title: 'Maximum Depth of Binary Tree', d: 'Easy', acc: '74.7%', tags: ['Tree', 'DFS', 'BFS'], status: 'solved',
        desc: `Given the root, return its maximum depth (number of nodes along the longest root-to-leaf path).`,
        examples: [{ input: 'root = [3,9,20,null,null,15,7]', output: '3' }],
        constraints: ['Number of nodes is [0,10⁴].'],
        testCases: [{ input: '[3,9,20,null,null,15,7]', expected: '3' }, { input: '[1,null,2]', expected: '2' }]
    },
    {
        id: 121, title: 'Best Time to Buy and Sell Stock', d: 'Easy', acc: '54.5%', tags: ['Array', 'Dynamic Programming'], status: 'solved',
        desc: `Given array prices where prices[i] is the price on day i, maximize profit by choosing a day to buy and a day to sell.`,
        examples: [{ input: 'prices = [7,1,5,3,6,4]', output: '5', exp: 'Buy day 2 (1), sell day 5 (6)' }],
        constraints: ['1 <= prices.length <= 10⁵'],
        testCases: [{ input: '[7,1,5,3,6,4]', expected: '5' }, { input: '[7,6,4,3,1]', expected: '0' }]
    },
    {
        id: 124, title: 'Binary Tree Maximum Path Sum', d: 'Hard', acc: '40.2%', tags: ['Dynamic Programming', 'Tree', 'DFS'], status: null,
        desc: `Given the root, return the maximum path sum of any non-empty path in the binary tree.`,
        examples: [{ input: 'root = [1,2,3]', output: '6' }, { input: 'root = [-10,9,20,null,null,15,7]', output: '42' }],
        constraints: ['Number of nodes is [1,3 × 10⁴].'],
        testCases: [{ input: '[1,2,3]', expected: '6' }, { input: '[-10,9,20,null,null,15,7]', expected: '42' }]
    },
    {
        id: 128, title: 'Longest Consecutive Sequence', d: 'Medium', acc: '47.7%', tags: ['Array', 'Hash Table', 'Union Find'], status: null,
        desc: `Given an unsorted array, return the length of the longest consecutive elements sequence in O(n) time.`,
        examples: [{ input: 'nums = [100,4,200,1,3,2]', output: '4', exp: 'Sequence is [1,2,3,4]' }],
        constraints: ['0 <= nums.length <= 10⁵'],
        testCases: [{ input: '[100,4,200,1,3,2]', expected: '4' }, { input: '[0,3,7,2,5,8,4,6,0,1]', expected: '9' }]
    },
    {
        id: 136, title: 'Single Number', d: 'Easy', acc: '73.8%', tags: ['Array', 'Bit Manipulation'], status: 'solved',
        desc: `Every element appears twice except for one. Find that single one in O(n) time and O(1) space.`,
        examples: [{ input: 'nums = [2,2,1]', output: '1' }, { input: 'nums = [4,1,2,1,2]', output: '4' }],
        constraints: ['1 <= nums.length <= 3 × 10⁴'],
        testCases: [{ input: '[2,2,1]', expected: '1' }, { input: '[4,1,2,1,2]', expected: '4' }, { input: '[1]', expected: '1' }]
    },
    {
        id: 141, title: 'Linked List Cycle', d: 'Easy', acc: '49.5%', tags: ['Hash Table', 'Linked List', 'Two Pointers'], status: 'solved',
        desc: `Given head, determine if the linked list has a cycle. Return true/false.`,
        examples: [{ input: 'head = [3,2,0,-4], pos = 1', output: 'true' }, { input: 'head = [1], pos = -1', output: 'false' }],
        constraints: ['Number of nodes is [0,10⁴].'],
        testCases: [{ input: '[3,2,0,-4]\n1', expected: 'true' }, { input: '[1,2]\n0', expected: 'true' }, { input: '[1]\n-1', expected: 'false' }]
    },
    {
        id: 146, title: 'LRU Cache', d: 'Medium', acc: '43.1%', tags: ['Hash Table', 'Linked List', 'Design'], status: null,
        desc: `Design a data structure that follows LRU cache constraints. Implement get and put in O(1) time.`,
        examples: [{ input: '["LRUCache","put","put","get","put","get"]', output: '[null,null,null,1,null,-1]' }],
        constraints: ['1 <= capacity <= 3000'],
        testCases: [{ input: '2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2', expected: '1\n-1' }]
    },
    {
        id: 152, title: 'Maximum Product Subarray', d: 'Medium', acc: '34.9%', tags: ['Array', 'Dynamic Programming'], status: null,
        desc: `Find a contiguous subarray within an array that has the largest product.`,
        examples: [{ input: 'nums = [2,3,-2,4]', output: '6' }, { input: 'nums = [-2,0,-1]', output: '0' }],
        constraints: ['1 <= nums.length <= 2 × 10⁴'],
        testCases: [{ input: '[2,3,-2,4]', expected: '6' }, { input: '[-2,0,-1]', expected: '0' }]
    },
    {
        id: 153, title: 'Find Minimum in Rotated Sorted Array', d: 'Medium', acc: '52.0%', tags: ['Array', 'Binary Search'], status: null,
        desc: `Given a sorted rotated array of unique elements, find the minimum element in O(log n).`,
        examples: [{ input: 'nums = [3,4,5,1,2]', output: '1' }],
        constraints: ['1 <= n <= 5000', 'All integers are unique.'],
        testCases: [{ input: '[3,4,5,1,2]', expected: '1' }, { input: '[4,5,6,7,0,1,2]', expected: '0' }, { input: '[1]', expected: '1' }]
    },
    {
        id: 169, title: 'Majority Element', d: 'Easy', acc: '64.4%', tags: ['Array', 'Hash Table', 'Sorting', 'Counting'], status: null,
        desc: `Given array nums of size n, return the majority element (appears more than ⌊n/2⌋ times).`,
        examples: [{ input: 'nums = [3,2,3]', output: '3' }],
        constraints: ['1 <= n <= 5 × 10⁴'],
        testCases: [{ input: '[3,2,3]', expected: '3' }, { input: '[2,2,1,1,1,2,2]', expected: '2' }]
    },
    {
        id: 198, title: 'House Robber', d: 'Medium', acc: '50.6%', tags: ['Array', 'Dynamic Programming'], status: null,
        desc: `Each house has money stashed. Adjacent houses have connected security. Determine max amount you can rob without alerting police.`,
        examples: [{ input: 'nums = [1,2,3,1]', output: '4' }, { input: 'nums = [2,7,9,3,1]', output: '12' }],
        constraints: ['1 <= nums.length <= 100'],
        testCases: [{ input: '[1,2,3,1]', expected: '4' }, { input: '[2,7,9,3,1]', expected: '12' }]
    },
    {
        id: 200, title: 'Number of Islands', d: 'Medium', acc: '59.2%', tags: ['Array', 'DFS', 'BFS', 'Union Find', 'Matrix'], status: 'attempted',
        desc: `Given an m x n 2D binary grid representing land ('1') and water ('0'), return the number of islands.`,
        examples: [{ input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]', output: '2' }],
        constraints: ['1 <= m, n <= 300'],
        testCases: [{ input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expected: '1' }, { input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expected: '3' }]
    },
    {
        id: 206, title: 'Reverse Linked List', d: 'Easy', acc: '75.6%', tags: ['Linked List', 'Recursion'], status: 'solved',
        desc: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
        examples: [{ input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }],
        constraints: ['Number of nodes is [0,5000].'],
        testCases: [{ input: '[1,2,3,4,5]', expected: '[5,4,3,2,1]' }, { input: '[1,2]', expected: '[2,1]' }, { input: '[]', expected: '[]' }]
    },
    {
        id: 207, title: 'Course Schedule', d: 'Medium', acc: '46.4%', tags: ['DFS', 'BFS', 'Graph', 'Topological Sort'], status: null,
        desc: `There are numCourses courses with prerequisites. Return true if you can finish all courses.`,
        examples: [{ input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true' }],
        constraints: ['1 <= numCourses <= 2000'],
        testCases: [{ input: '2\n[[1,0]]', expected: 'true' }, { input: '2\n[[1,0],[0,1]]', expected: 'false' }]
    },
    {
        id: 226, title: 'Invert Binary Tree', d: 'Easy', acc: '77.2%', tags: ['Tree', 'DFS', 'BFS'], status: 'solved',
        desc: `Given the root of a binary tree, invert the tree and return its root.`,
        examples: [{ input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' }],
        constraints: ['Number of nodes is [0,100].'],
        testCases: [{ input: '[4,2,7,1,3,6,9]', expected: '[4,7,2,9,6,3,1]' }, { input: '[2,1,3]', expected: '[2,3,1]' }]
    },
    {
        id: 238, title: 'Product of Array Except Self', d: 'Medium', acc: '66.8%', tags: ['Array', 'Prefix Sum'], status: null,
        desc: `Return array where answer[i] equals product of all elements except nums[i]. O(n) time, no division.`,
        examples: [{ input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' }],
        constraints: ['2 <= nums.length <= 10⁵'],
        testCases: [{ input: '[1,2,3,4]', expected: '[24,12,8,6]' }, { input: '[-1,1,0,-3,3]', expected: '[0,0,9,0,0]' }]
    },
    {
        id: 283, title: 'Move Zeroes', d: 'Easy', acc: '61.9%', tags: ['Array', 'Two Pointers'], status: null,
        desc: `Move all 0's to the end while maintaining the relative order of non-zero elements. Do it in-place.`,
        examples: [{ input: 'nums = [0,1,0,3,12]', output: '[1,3,12,0,0]' }],
        constraints: ['1 <= nums.length <= 10⁴'],
        testCases: [{ input: '[0,1,0,3,12]', expected: '[1,3,12,0,0]' }, { input: '[0]', expected: '[0]' }]
    },
    {
        id: 295, title: 'Find Median from Data Stream', d: 'Hard', acc: '51.7%', tags: ['Two Pointers', 'Design', 'Heap'], status: null,
        desc: `Design a class to support addNum and findMedian from a data stream.`,
        examples: [{ input: 'addNum(1), addNum(2), findMedian(), addNum(3), findMedian()', output: '1.5, 2.0' }],
        constraints: ['At most 5 × 10⁴ calls.'],
        testCases: [{ input: 'addNum 1\naddNum 2\nfindMedian\naddNum 3\nfindMedian', expected: '1.5\n2.0' }]
    },
    {
        id: 300, title: 'Longest Increasing Subsequence', d: 'Medium', acc: '55.0%', tags: ['Array', 'Binary Search', 'Dynamic Programming'], status: null,
        desc: `Given integer array nums, return the length of the longest strictly increasing subsequence.`,
        examples: [{ input: 'nums = [10,9,2,5,3,7,101,18]', output: '4', exp: 'LIS is [2,3,7,101]' }],
        constraints: ['1 <= nums.length <= 2500'],
        testCases: [{ input: '[10,9,2,5,3,7,101,18]', expected: '4' }, { input: '[0,1,0,3,2,3]', expected: '4' }, { input: '[7,7,7,7,7]', expected: '1' }]
    },
    {
        id: 322, title: 'Coin Change', d: 'Medium', acc: '44.6%', tags: ['Array', 'Dynamic Programming', 'BFS'], status: null,
        desc: `Given coins and an amount, return fewest coins needed. Return -1 if not possible.`,
        examples: [{ input: 'coins = [1,2,5], amount = 11', output: '3', exp: '11 = 5+5+1' }],
        constraints: ['1 <= coins.length <= 12', '0 <= amount <= 10⁴'],
        testCases: [{ input: '[1,2,5]\n11', expected: '3' }, { input: '[2]\n3', expected: '-1' }, { input: '[1]\n0', expected: '0' }]
    },
];

const allTags = [...new Set(problems.flatMap(p => p.tags))].sort();
const tagCounts = {};
problems.forEach(p => p.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
const stats = {
    total: problems.length, easy: problems.filter(p => p.d === 'Easy').length,
    medium: problems.filter(p => p.d === 'Medium').length, hard: problems.filter(p => p.d === 'Hard').length,
    solved: problems.filter(p => p.status === 'solved').length, attempted: problems.filter(p => p.status === 'attempted').length,
};
export { problems, allTags, tagCounts, stats };
export default problems;
