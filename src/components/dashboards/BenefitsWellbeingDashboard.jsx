import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorBoundary from '../ui/ErrorBoundary';
import {
  Heart,
  Shield,
  Users,
  DollarSign,
  Brain,
  TrendingUp,
  Award,
  UserCheck,
  HeartHandshake,
  Briefcase,
  Activity,
  Gift,
  BookOpen,
  ArrowUpRight,
  Layers,
  Zap
} from 'lucide-react';

const BenefitsWellbeingDashboard = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  // Modern color palette
  const colors = {
    primary: '#1F74DB',
    softBlue: '#95D2F3', 
    warmGray: '#D7D2CB',
    green: '#71CC98',
    yellow: '#FFC72C',
    dark: '#00245D'
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        {/* Modern Minimal Header */}
        <div className="bg-white">
          <div className="w-[85%] max-w-[1280px] mx-auto py-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl" style={{ backgroundColor: `${colors.green}20` }}>
                  <Heart className="w-6 h-6" style={{ color: colors.green }} />
                </div>
                <span className="text-sm font-medium uppercase tracking-wider" style={{ color: colors.primary }}>
                  FY2025 Wins
                </span>
              </div>
              <h1 className="text-5xl font-light mb-4" style={{ color: colors.dark }}>
                Benefits & <span style={{ color: colors.green }}>Well-being</span>
              </h1>
              <p className="text-lg font-light" style={{ color: '#6B7280' }}>
                Transforming employee health, security, and quality of life
              </p>
          </div>
        </div>

        <div className="w-[85%] max-w-[1280px] mx-auto pt-5 pb-8">
          {/* Strategic Cost Reduction Initiative - Hero Section */}
          <div className="mb-16">
            <div className="bg-gradient-to-r from-white to-blue-50 rounded-3xl p-12 relative overflow-hidden shadow-lg border border-blue-100">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full" style={{ backgroundColor: colors.primary }}></div>
                <div className="absolute -left-20 bottom-0 w-80 h-80 rounded-full" style={{ backgroundColor: colors.softBlue }}></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="grid grid-cols-12 gap-12">
                  {/* Left: Main Metric */}
                  <div className="col-span-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-white shadow-sm">
                        <DollarSign className="w-6 h-6" style={{ color: colors.green }} />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-wider" style={{ color: colors.primary }}>
                        Strategic Cost Reduction
                      </span>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-baseline gap-3">
                        <span className="text-7xl font-bold bg-gradient-to-r text-transparent bg-clip-text"
                              style={{ backgroundImage: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.green} 100%)` }}>
                          $3M
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" style={{ color: colors.green }} />
                        <span className="text-lg font-medium" style={{ color: colors.green }}>Since FY 2024-25</span>
                      </div>
                    </div>
                    
                    <p className="text-lg leading-relaxed mb-6" style={{ color: '#4B5563' }}>
                      Significant cost reductions achieved through negotiations across medical administration, pharmacy contracting, global policy changes and wellness vendor programming to help offset increase in costs and added cost for benefit enhancements.
                    </p>
                    
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5" style={{ color: colors.yellow }} />
                        <span className="font-semibold" style={{ color: colors.dark }}>Key Achievement</span>
                      </div>
                      <p className="mt-2 text-sm" style={{ color: '#6B7280' }}>
                        These savings are being used to offset cost increases and fund new benefit enhancements
                      </p>
                    </div>
                  </div>
                  
                  {/* Right: UHC Success Story */}
                  <div className="col-span-5 flex justify-end">
                    <div className="bg-gradient-to-r rounded-xl p-6 text-white w-full max-w-lg"
                         style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.softBlue} 100%)` }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="w-5 h-5" />
                            <span className="font-semibold">UHC Wellness Credits Success Story</span>
                          </div>
                          <p className="text-sm opacity-90">
                            Negotiated from $30K (2023) → $60K (2024) → $150K (2025-2027)
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">500%</div>
                          <div className="text-xs opacity-75">increase</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Cost Optimization Breakdown - Below */}
                <div className="mt-12">
                  <h3 className="text-xl font-semibold mb-6" style={{ color: colors.dark }}>
                    Cost Optimization Breakdown
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { 
                        label: 'Medical Administration', 
                        value: '$900K+',
                        percentage: 30,
                        description: 'Administrative efficiencies and process improvements',
                        icon: Briefcase,
                        color: colors.primary 
                      },
                      { 
                        label: 'Pharmacy Contracting & Rebates', 
                        value: '$850K+',
                        percentage: 28,
                        description: 'Enhanced rebate programs and contracting negotiations',
                        icon: Activity,
                        color: colors.softBlue 
                      },
                      { 
                        label: 'Global Policy Negotiations', 
                        value: '$750K+',
                        percentage: 25,
                        description: 'Strategic global policy and carrier negotiations',
                        icon: Layers,
                        color: colors.green 
                      },
                      { 
                        label: 'Wellness Vendor Programming', 
                        value: '$500K+',
                        percentage: 17,
                        description: 'Optimized wellness programs and vendor partnerships',
                        icon: Heart,
                        color: colors.yellow 
                      }
                    ].map((item, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: `${item.color}15` }}>
                            <item.icon className="w-5 h-5" style={{ color: item.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-semibold" style={{ color: colors.dark }}>{item.label}</span>
                                <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{item.description}</p>
                              </div>
                              <span className="font-bold text-lg" style={{ color: item.color }}>{item.value}</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                              <div 
                                className="h-full rounded-full transition-all duration-700"
                                style={{ 
                                  width: `${item.percentage}%`,
                                  backgroundColor: item.color
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Achievements - Bento Box Layout */}
          <div className="grid grid-cols-12 gap-6 mb-16">
            {/* Navigate Partnership */}
            <div className="col-span-4">
              <div className="bg-white rounded-2xl p-8 h-full hover:shadow-lg transition-all cursor-pointer"
                   onMouseEnter={() => setHoveredCard('navigate')}
                   onMouseLeave={() => setHoveredCard(null)}>
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.green}15` }}>
                    <HeartHandshake className="w-6 h-6" style={{ color: colors.green }} />
                  </div>
                  {hoveredCard === 'navigate' && (
                    <ArrowUpRight className="w-5 h-5" style={{ color: colors.primary }} />
                  )}
                </div>
                <h3 className="text-2xl font-semibold mb-3" style={{ color: colors.dark }}>
                  Navigate Partnership
                </h3>
                <p className="font-light mb-4" style={{ color: '#6B7280' }}>
                  New well-being provider selected through comprehensive RFP for 2025
                </p>
                <div className="pt-4 border-t" style={{ borderColor: '#F3F4F6' }}>
                  <div className="flex items-center gap-2 text-sm" style={{ color: colors.green }}>
                    <Gift className="w-4 h-4" />
                    <span>Incentive framework reintroduced</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Resources Hub */}
            <div className="col-span-4">
              <div className="bg-white rounded-2xl p-8 h-full hover:shadow-lg transition-all cursor-pointer"
                   onMouseEnter={() => setHoveredCard('resources')}
                   onMouseLeave={() => setHoveredCard(null)}>
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                    <BookOpen className="w-6 h-6" style={{ color: colors.primary }} />
                  </div>
                  {hoveredCard === 'resources' && (
                    <ArrowUpRight className="w-5 h-5" style={{ color: colors.primary }} />
                  )}
                </div>
                <h3 className="text-2xl font-semibold mb-3" style={{ color: colors.dark }}>
                  Resource Hub
                </h3>
                <p className="font-light mb-4" style={{ color: '#6B7280' }}>
                  Centralized benefits guide created with campus partners
                </p>
                <div className="pt-4 border-t" style={{ borderColor: '#F3F4F6' }}>
                  <div className="flex items-center gap-2 text-sm" style={{ color: colors.primary }}>
                    <Users className="w-4 h-4" />
                    <span>All benefits & perks in one place</span>
                  </div>
                </div>
              </div>
            </div>

            {/* UHC Wellness Growth */}
            <div className="col-span-4">
              <div className="bg-gradient-to-br rounded-2xl p-8 h-full text-white relative overflow-hidden hover:shadow-lg transition-all"
                   style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.softBlue} 100%)` }}>
                <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-20 bg-white"></div>
                <div className="relative z-10">
                  <div className="mb-6">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">
                    UHC Wellness Credits
                  </h3>
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-4xl font-bold">$150K</span>
                    <span className="text-sm opacity-90">per year</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="opacity-90">500% increase from 2023</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefit Enhancements - Modern Cards */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-8" style={{ color: colors.dark }}>
              Enhanced Benefits for 2025
            </h2>
            
            <div className="grid grid-cols-4 gap-6">
              {/* Navigate Partnership */}
              <div className="group">
                <div className="bg-white rounded-2xl p-8 h-full border-2 transition-all hover:shadow-lg"
                     style={{ borderColor: 'transparent' }}
                     onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.green}
                     onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.green}15` }}>
                      <HeartHandshake className="w-5 h-5" style={{ color: colors.green }} />
                    </div>
                    <span className="font-medium" style={{ color: colors.dark }}>Navigate Partnership</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.green }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>New well-being provider for 2025</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.green }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>Selected through comprehensive RFP</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.green }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>Incentive framework reintroduced</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Mental Health */}
              <div className="group">
                <div className="bg-white rounded-2xl p-8 h-full border-2 transition-all hover:shadow-lg"
                     style={{ borderColor: 'transparent' }}
                     onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.green}
                     onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.green}15` }}>
                      <Brain className="w-5 h-5" style={{ color: colors.green }} />
                    </div>
                    <span className="font-medium" style={{ color: colors.dark }}>Mental Health Resources</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.green }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>Expanded Magellan EAP offerings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.green }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>BetterHelp virtual therapy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.green }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>Calm Health app access</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Voluntary Benefits */}
              <div className="group">
                <div className="bg-white rounded-2xl p-8 h-full border-2 transition-all hover:shadow-lg"
                     style={{ borderColor: 'transparent' }}
                     onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.primary}
                     onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.primary}15` }}>
                      <Shield className="w-5 h-5" style={{ color: colors.primary }} />
                    </div>
                    <span className="font-medium" style={{ color: colors.dark }}>Voluntary Benefits</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.primary }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>Allstate Identity Protection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.primary }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>Accident coverage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.primary }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>Critical illness & hospital</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Medicare Advocacy */}
              <div className="group">
                <div className="bg-white rounded-2xl p-8 h-full border-2 transition-all hover:shadow-lg"
                     style={{ borderColor: 'transparent' }}
                     onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.yellow}
                     onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.yellow}20` }}>
                      <UserCheck className="w-5 h-5" style={{ color: colors.yellow }} />
                    </div>
                    <span className="font-medium" style={{ color: colors.dark }}>Medicare Support</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.yellow }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>SmartConnect partnership</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.yellow }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>Personalized guidance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.yellow }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>Free educational resources</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Communication Enhancement - Full Width Card */}
          <div className="mb-16">
            <div className="rounded-3xl p-10 relative overflow-hidden"
                 style={{ background: `linear-gradient(135deg, ${colors.warmGray}20 0%, white 100%)` }}>
              <div className="grid grid-cols-12 gap-8 items-center">
                <div className="col-span-8">
                  <h3 className="text-3xl font-semibold mb-4" style={{ color: colors.dark }}>
                    Enhanced Communication Strategy
                  </h3>
                  <p className="text-lg font-light" style={{ color: '#6B7280' }}>
                    Strengthening communication efforts for all benefits, including leveraging the intranet for easily accessible information for all programs, distribution of the total reward statements and retirement plan statements to drive education and participation.
                  </p>
                </div>
                <div className="col-span-4 text-center">
                  <div className="inline-flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
                         style={{ backgroundColor: colors.softBlue }}>
                      <TrendingUp className="w-10 h-10 text-white" />
                    </div>
                    <span className="text-sm font-medium" style={{ color: colors.primary }}>
                      Driving Engagement
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Bottom Navigation */}
          <div className="flex justify-between items-center mt-16 pt-8 border-t" style={{ borderColor: '#E5E7EB' }}>
            <Link to="/dashboards" className="flex items-center gap-2 font-medium transition-colors"
                  style={{ color: colors.primary }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.dark}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.primary}>
              <span className="mr-1">←</span> Dashboard Home
            </Link>
            <div className="text-sm font-light" style={{ color: '#9CA3AF' }}>
              HR Benefits & Well-being • FY2025
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default BenefitsWellbeingDashboard;