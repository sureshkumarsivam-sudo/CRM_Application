const mongoose = require('mongoose');
const SettlementProposal = require('../models/SettlementProposal');
const Customer = require('../models/Customer');
const AuditLog = require('../models/AuditLog');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/crmdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

const sampleProposals = [
  {
    proposalType: 'Settlement',
    status: 'Active',
    proposedPercentage: 0.50, // 50% of outstanding
    paymentType: 'One-Time',
    numberOfInstallments: 1,
  },
  {
    proposalType: 'Closure',
    status: 'Pending L1',
    proposedPercentage: 0.70, // 70% of outstanding
    paymentType: 'Installment',
    numberOfInstallments: 2,
  },
  {
    proposalType: 'Settlement',
    status: 'Pending L2',
    proposedPercentage: 0.60, // 60% of outstanding
    paymentType: 'One-Time',
    numberOfInstallments: 1,
  },
  {
    proposalType: 'Settlement',
    status: 'Active',
    proposedPercentage: 0.40, // 40% of outstanding
    paymentType: 'Installment',
    numberOfInstallments: 3,
  },
  {
    proposalType: 'Closure',
    status: 'Completed',
    proposedPercentage: 0.85, // 85% of outstanding
    paymentType: 'One-Time',
    numberOfInstallments: 1,
  },
];

async function seedSettlementProposals() {
  try {
    // Check if proposals already exist
    const existingCount = await SettlementProposal.countDocuments();
    
    if (existingCount > 0) {
      console.log(`ℹ️  ${existingCount} settlement proposals already exist.`);
      console.log('💡 To re-seed, delete existing proposals first.');
      process.exit(0);
    }

    // Get customers from database
    const customers = await Customer.find().limit(5);
    
    if (customers.length === 0) {
      console.error('❌ No customers found in database. Please add customers first.');
      process.exit(1);
    }

    console.log(`📊 Found ${customers.length} customers to create proposals for...`);

    const proposals = [];
    
    for (let i = 0; i < sampleProposals.length; i++) {
      const customer = customers[i % customers.length];
      const template = sampleProposals[i];
      
      const totalOutstanding = customer.currentOutstanding || customer.totalOutstanding || 150000;
      const proposedAmount = Math.round(totalOutstanding * template.proposedPercentage);
      const waiverAmount = Math.max(0, totalOutstanding - proposedAmount);
      const waiverPercentage = totalOutstanding > 0 ? ((waiverAmount / totalOutstanding) * 100).toFixed(2) : 0;
      
      // Generate installments if needed
      const installments = [];
      if (template.paymentType === 'Installment') {
        const installmentAmount = proposedAmount / template.numberOfInstallments;
        
        for (let j = 1; j <= template.numberOfInstallments; j++) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + j);
          
          installments.push({
            installmentNumber: j,
            amount: parseFloat(installmentAmount.toFixed(2)),
            dueDate: dueDate,
            status: template.status === 'Completed' ? 'Paid' : 'Pending'
          });
        }
      }

      const proposal = {
        proposalType: template.proposalType,
        customerId: customer._id,
        accountNumber: customer.loanId,
        customerName: customer.accountName || customer.customerName || `Customer ${i + 1}`,
        totalOutstanding: totalOutstanding,
        principalOutstanding: customer.principalOutstanding || totalOutstanding * 0.7,
        proposedAmount: proposedAmount,
        waiverAmount: waiverAmount,
        waiverPercentage: parseFloat(waiverPercentage),
        paymentType: template.paymentType,
        numberOfInstallments: template.numberOfInstallments,
        installments: installments,
        status: template.status,
        notes: `Sample ${template.proposalType.toLowerCase()} proposal for ${customer.accountName || customer.customerName || `Customer ${i + 1}`}`,
        createdBy: {
          name: 'Initiator',
          userId: 'system',
          role: 'Initiator'
        }
      };

      // Add approval dates for approved proposals
      if (template.status === 'Pending L2' || template.status === 'Active' || template.status === 'Completed') {
        proposal.approvals = [
          {
            level: 'L1',
            status: 'Approved',
            approvedBy: {
              name: 'Manager L1',
              userId: 'manager-l1',
              role: 'Manager L1'
            },
            approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            comments: 'Approved for L2 review'
          }
        ];
      }

      if (template.status === 'Active' || template.status === 'Completed') {
        proposal.approvals.push({
          level: 'L2',
          status: 'Approved',
          approvedBy: {
            name: 'Manager L2',
            userId: 'manager-l2',
            role: 'Manager L2'
          },
          approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          comments: 'Approved and letter generated'
        });
        proposal.approvalDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
        proposal.letterGenerated = true;
        proposal.letterGeneratedDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      }

      if (template.status === 'Completed') {
        proposal.completionDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // 1 day ago
      }

      proposals.push(proposal);
    }

    // Insert proposals one by one to trigger pre-save hooks
    const inserted = [];
    for (const proposalData of proposals) {
      const proposal = new SettlementProposal(proposalData);
      await proposal.save();
      inserted.push(proposal);
    }

    // Create audit logs for each proposal
    for (const proposal of inserted) {
      await AuditLog.create({
        proposalId: proposal._id,
        letterId: proposal.letterId,
        action: 'Proposal Created',
        user: {
          name: 'Initiator',
          userId: 'system',
          role: 'Initiator'
        },
        details: `${proposal.proposalType} proposal created for ${proposal.customerName}`,
        previousStatus: '',
        newStatus: 'Pending L1'
      });

      // Add audit logs for approvals
      if (proposal.status !== 'Pending L1') {
        await AuditLog.create({
          proposalId: proposal._id,
          letterId: proposal.letterId,
          action: 'L1 Approved',
          user: {
            name: 'Manager L1',
            userId: 'manager-l1',
            role: 'Manager L1'
          },
          details: 'Approved for L2 review',
          previousStatus: 'Pending L1',
          newStatus: 'Pending L2',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        });
      }

      if (proposal.status === 'Active' || proposal.status === 'Completed') {
        await AuditLog.create({
          proposalId: proposal._id,
          letterId: proposal.letterId,
          action: 'L2 Approval & Letter Generation',
          user: {
            name: 'Manager L2',
            userId: 'manager-l2',
            role: 'Manager L2'
          },
          details: 'Approved and letter generated',
          previousStatus: 'Pending L2',
          newStatus: 'Active',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        });
      }

      if (proposal.status === 'Completed') {
        await AuditLog.create({
          proposalId: proposal._id,
          letterId: proposal.letterId,
          action: 'Proposal Completed',
          user: {
            name: 'System',
            userId: 'system',
            role: 'Admin'
          },
          details: 'All installments paid, proposal completed',
          previousStatus: 'Active',
          newStatus: 'Completed',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        });
      }
    }

    console.log(`✅ Successfully seeded ${inserted.length} settlement proposals`);
    console.log('📊 Proposal breakdown:');
    console.log(`   - Pending L1: ${proposals.filter(p => p.status === 'Pending L1').length}`);
    console.log(`   - Pending L2: ${proposals.filter(p => p.status === 'Pending L2').length}`);
    console.log(`   - Active: ${proposals.filter(p => p.status === 'Active').length}`);
    console.log(`   - Completed: ${proposals.filter(p => p.status === 'Completed').length}`);
    console.log(`   - Settlements: ${proposals.filter(p => p.proposalType === 'Settlement').length}`);
    console.log(`   - Closures: ${proposals.filter(p => p.proposalType === 'Closure').length}`);
    console.log('\n📋 Sample Letter IDs generated:');
    inserted.forEach(p => console.log(`   - ${p.letterId} (${p.customerName})`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding settlement proposals:', error);
    process.exit(1);
  }
}

// Run the seed function
seedSettlementProposals();
